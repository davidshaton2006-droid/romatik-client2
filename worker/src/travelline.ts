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

import { findBookingsInCabinRange, listSyncedTravelLineBookings, setBookingDoc } from './firestore';

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

export const TL_AUTH_URL = 'https://partner.tlintegration.com/auth/token';
export const TL_API_BASE = 'https://partner.tlintegration.com/api';

// TravelLine roomType.id -> our house_type label, matching what the staff
// app already expects (see src/lib/firebase/config.ts's `Двухместный`/
// `Трехместный` convention).
export const ROOM_TYPE_TO_HOUSE_TYPE: Record<string, string> = {
  '412497': 'Двухместный',
  '412498': 'Трехместный'
};

// The staff app's dashboard matches a booking to a cabin card purely by
// cabin_id (see HARDCODED_CABINS in its Dashboard.tsx) — TravelLine never
// gives us a specific physical unit, only a room *type*, so one has to be
// picked here or these bookings are invisible in that view.
export const HOUSE_TYPE_CABIN_RANGE: Record<string, [number, number]> = {
  Двухместный: [1, 10],
  Трехместный: [11, 20]
};

// Real physical cabin counts (business reality) — HOUSE_TYPE_CABIN_RANGE
// above reserves extra virtual double-cabin slots (8-10) precisely so
// channel-only bookings without a specific real cabin (like TravelLine
// reservations, or the quota blocks in travellineAvailability.ts) have
// somewhere to go without colliding with real double cabins 1-7.
export const TOTAL_CABINS: Record<string, number> = {
  Двухместный: 7,
  Трехместный: 10
};

export function datesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Picks a free cabin number for the given house type/dates, checking
 * against existing bookings in that id range. `cache` holds one Firestore
 * query's result per house type for the lifetime of a sync run, updated
 * in place as ids get assigned, so several new bookings of the same type
 * in one run don't collide with each other.
 */
async function assignCabinId(
  env: TravelLineEnv,
  houseType: string,
  checkIn: string,
  checkOut: string,
  cache: Map<string, Array<{ cabin_id: number; check_in: string; check_out: string }>>
): Promise<number> {
  const range = HOUSE_TYPE_CABIN_RANGE[houseType];
  if (!range) return 0;
  const [min, max] = range;

  let existing = cache.get(houseType);
  if (!existing) {
    existing = await findBookingsInCabinRange(env, min, max);
    cache.set(houseType, existing);
  }

  for (let id = min; id <= max; id++) {
    const occupied = existing.some((b) => b.cabin_id === id && datesOverlap(checkIn, checkOut, b.check_in, b.check_out));
    if (!occupied) {
      existing.push({ cabin_id: id, check_in: checkIn, check_out: checkOut });
      return id;
    }
  }

  // No free slot in range — shouldn't normally happen (would mean this
  // house type is fully booked for these dates across every channel).
  return min;
}

let cachedTlToken: { token: string; expiresAt: number } | null = null;

export async function getTravelLineToken(env: TravelLineEnv): Promise<string> {
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

export async function sendTelegramNotification(
  env: Pick<TravelLineEnv, 'TELEGRAM_BOT_TOKEN' | 'TELEGRAM_CHAT_ID'>,
  text: string
): Promise<void> {
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
  const cabinCache = new Map<string, Array<{ cabin_id: number; check_in: string; check_out: string }>>();

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
    const checkIn = stay.stayDates.arrivalDateTime.slice(0, 10);
    const checkOut = stay.stayDates.departureDateTime.slice(0, 10);

    // Only occupy a numbered cabin slot for live bookings — a cancelled
    // one shouldn't hold a spot, and doesn't need to be visible on the grid.
    const cabinId = b.status === 'Active' ? await assignCabinId(env, houseType, checkIn, checkOut, cabinCache) : 0;

    const fields: Record<string, string | number | boolean> = {
      cabin_id: cabinId,
      house_type: houseType,
      check_in: checkIn,
      check_out: checkOut,
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

    // Matches the staff app's own #BACKUP_DATA convention (src/lib/telegram.ts)
    // so its "restore from Telegram" tool can reconstruct these too — this
    // tag is NOT what makes bookings show up live; the direct Firestore
    // write above already does that.
    const backupData = JSON.stringify({
      entityType: 'booking',
      action: b.status === 'Active' ? 'create' : 'delete',
      data: { id: docId, ...fields, created_at: b.modifiedDateTime }
    });

    if (!alreadySynced && b.status === 'Active') {
      created++;
      await sendTelegramNotification(
        env,
        `🟢 Новая бронь из TravelLine! (Канал: ${sourceLabel})\n` +
          `🏠 ${houseType} №${cabinId} | Гость: ${guestName}\n` +
          `📅 Даты: ${fields.check_in} — ${fields.check_out}\n` +
          `💰 Сумма: ${totalPrice.toLocaleString('ru-RU')} ₽ | Внесено: ${prepayment.toLocaleString('ru-RU')} ₽\n` +
          `🆔 № ${b.number}\n\n#BACKUP_DATA: ${backupData}`
      );
    } else if (alreadySynced && b.status === 'Cancelled') {
      await sendTelegramNotification(
        env,
        `🔴 Отмена брони TravelLine\n🏠 ${houseType} | Гость: ${guestName}\n🆔 № ${b.number}\n\n#BACKUP_DATA: ${backupData}`
      );
    }
  }

  return { processed: summaries.length, created, skipped };
}

export function verifyTravelLineWebhook(request: Request, env: TravelLineEnv): boolean {
  const key = request.headers.get('X-Webhook-Key');
  return !!env.TRAVELLINE_WEBHOOK_KEY && key === env.TRAVELLINE_WEBHOOK_KEY;
}
