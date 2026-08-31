/**
 * Pulls bookings from TravelLine (Read Reservation API) into the shared
 * Firestore `bookings` collection, so the staff app sees them exactly like
 * bookings created any other way — including the Telegram notification.
 *
 * TravelLine is a channel manager: bookings can originate from its own
 * widget, or from OTAs (Avito, Yandex, etc.) connected through it. There is
 * no webhook payload we can trust for full booking data (TravelLine's own
 * docs say sales channels aren't notified of each other's bookings), so a
 * webhook hit is treated purely as a "go check now" signal — the actual
 * data always comes from a fresh API call. A scheduled Cron Trigger runs
 * the same sync as a backup in case a webhook is missed or never configured.
 */

import { listSyncedTravelLineBookings, setBookingDoc } from './firestore';

export interface TravelLineEnv {
  TRAVELLINE_CLIENT_ID: string;
  TRAVELLINE_CLIENT_SECRET: string;
  TRAVELLINE_PROPERTY_ID: string;
  TRAVELLINE_WEBHOOK_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_DATABASE_ID: string;
}

const TL_AUTH_URL = 'https://partner.tlintegration.com/auth/token';
const TL_API_BASE = 'https://partner.tlintegration.com/api';

// TravelLine roomType.id -> our house_type label, matching what the staff
// app already expects (see src/lib/firebase/config.ts's `Двухместный`/
// `Трехместный` convention).
const ROOM_TYPE_TO_HOUSE_TYPE: Record<string, string> = {
  '412497': 'Двухместный',
  '412498': 'Трехместный'
};

let cachedTlToken: { token: string; expiresAt: number } | null = null;

async function getTravelLineToken(env: TravelLineEnv): Promise<string> {
  if (cachedTlToken && cachedTlToken.expiresAt > Date.now() + 30_000) {
    return cachedTlToken.token;
  }

  const res = await fetch(TL_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.TRAVELLINE_CLIENT_ID,
      client_secret: env.TRAVELLINE_CLIENT_SECRET
    })
  });

  if (!res.ok) {
    throw new Error(`TravelLine auth failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedTlToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

interface BookingSummary {
  number: string;
  status: 'Active' | 'Cancelled' | string;
  modifiedDateTime: string;
}

async function listBookingSummaries(env: TravelLineEnv, token: string): Promise<BookingSummary[]> {
  const summaries: BookingSummary[] = [];
  let continueToken: string | undefined;

  // Cap pagination so a single sync run can't run away; the recent-changes
  // window is what matters for catching new bookings.
  for (let page = 0; page < 5; page++) {
    const url = new URL(`${TL_API_BASE}/read-reservation/v1/properties/${env.TRAVELLINE_PROPERTY_ID}/bookings`);
    if (continueToken) url.searchParams.set('continueToken', continueToken);

    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      throw new Error(`TravelLine bookings list failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
      bookingSummaries: BookingSummary[];
      hasMoreData: boolean;
      continueToken?: string;
    };
    summaries.push(...data.bookingSummaries);

    if (!data.hasMoreData || !data.continueToken) break;
    continueToken = data.continueToken;
  }

  return summaries;
}

interface BookingDetail {
  booking: {
    number: string;
    status: string;
    modifiedDateTime: string;
    guaranteeInfo?: { totalPrepaid?: number };
    currencyCode: string;
    roomStays: Array<{
      stayDates: { arrivalDateTime: string; departureDateTime: string };
      roomType: { id: string; name: string };
      guests: Array<{ firstName?: string; lastName?: string }>;
    }>;
    total: { priceAfterTax: number };
    source?: { type?: string; code?: string };
    customer?: { firstName?: string; lastName?: string };
  };
}

async function getBookingDetail(env: TravelLineEnv, token: string, number: string): Promise<BookingDetail> {
  const res = await fetch(
    `${TL_API_BASE}/read-reservation/v1/properties/${env.TRAVELLINE_PROPERTY_ID}/bookings/${encodeURIComponent(number)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    throw new Error(`TravelLine booking detail failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function sendTelegramNotification(env: TravelLineEnv, text: string): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true })
    });
  } catch (err) {
    console.warn('Telegram notification failed (non-fatal):', err);
  }
}

/**
 * Syncs recently created/modified TravelLine bookings into Firestore.
 * Safe to call repeatedly (webhook + cron both call this) — writes are
 * idempotent upserts keyed by TravelLine's own booking number, and a
 * Telegram notification only fires the first time a given booking is seen.
 */
export async function syncTravelLineBookings(env: TravelLineEnv): Promise<{ processed: number; created: number; skipped: number }> {
  const token = await getTravelLineToken(env);

  // One query up front instead of a per-booking existence check — Workers
  // cap subrequests per invocation, and most runs have few or no changes.
  const [summaries, synced] = await Promise.all([listBookingSummaries(env, token), listSyncedTravelLineBookings(env)]);

  let created = 0;
  let skipped = 0;

  for (const summary of summaries) {
    const docId = `tl_${summary.number}`;
    const known = synced.get(summary.number);
    const alreadySynced = !!known;

    // Nothing changed since last sync — skip entirely, no subrequests spent.
    if (known && known.modified === summary.modifiedDateTime) {
      skipped++;
      continue;
    }

    // Skip cancelled bookings we've never seen — nothing useful to record.
    if (summary.status !== 'Active' && !alreadySynced) continue;

    const detail = await getBookingDetail(env, token, summary.number);
    const b = detail.booking;
    const stay = b.roomStays[0];
    if (!stay) continue;

    const guest = stay.guests?.[0] || b.customer || {};
    const guestName = `${guest.firstName || ''} ${guest.lastName || ''}`.trim() || 'Гость TravelLine';
    const totalPrice = b.total?.priceAfterTax || 0;
    const prepayment = b.guaranteeInfo?.totalPrepaid || 0;
    const houseType = ROOM_TYPE_TO_HOUSE_TYPE[stay.roomType.id] || stay.roomType.name;
    const sourceLabel = b.source?.code || b.source?.type || 'TravelLine';

    const fields: Record<string, string | number | boolean> = {
      cabin_id: 0, // TravelLine doesn't allocate a specific physical cabin — staff assigns one
      house_type: houseType,
      check_in: stay.stayDates.arrivalDateTime.slice(0, 10),
      check_out: stay.stayDates.departureDateTime.slice(0, 10),
      guest_last_name: guestName,
      guest_phone: '',
      prepayment,
      total_price: totalPrice,
      remaining_balance: Math.max(0, totalPrice - prepayment),
      is_fully_paid: prepayment >= totalPrice,
      created_by: 'travelline',
      created_by_name: `TravelLine (${sourceLabel})`,
      comment: `Источник: TravelLine, бронь №${b.number}`,
      travelline_number: b.number,
      travelline_status: b.status,
      travelline_modified: b.modifiedDateTime
    };

    await setBookingDoc(env, docId, fields);

    if (!alreadySynced && b.status === 'Active') {
      created++;
      await sendTelegramNotification(
        env,
        `🟢 Новая бронь из TravelLine! (Канал: ${sourceLabel})\n` +
          `🏠 ${houseType} | Гость: ${guestName}\n` +
          `📅 Даты: ${fields.check_in} — ${fields.check_out}\n` +
          `💰 Сумма: ${totalPrice.toLocaleString('ru-RU')} ₽ | Внесено: ${prepayment.toLocaleString('ru-RU')} ₽\n` +
          `🆔 № ${b.number}`
      );
    } else if (alreadySynced && b.status === 'Cancelled') {
      await sendTelegramNotification(
        env,
        `🔴 Отмена брони TravelLine\n🏠 ${houseType} | Гость: ${guestName}\n🆔 № ${b.number}`
      );
    }
  }

  return { processed: summaries.length, created, skipped };
}

export function verifyTravelLineWebhook(request: Request, env: TravelLineEnv): boolean {
  const key = request.headers.get('X-Webhook-Key');
  return !!env.TRAVELLINE_WEBHOOK_KEY && key === env.TRAVELLINE_WEBHOOK_KEY;
}
