/**
 * Syncs REAL, live cabin availability from TravelLine's Search API into the
 * shared Firestore `bookings` collection — not just reservations (see
 * travelline.ts), but manual quota blocks made directly in TravelLine's
 * calendar for channels that aren't connected via the Read Reservation API.
 *
 * Why this exists: TravelLine lets the property reduce the number of
 * bookable units for a room type on a given night without creating an
 * actual reservation record (e.g. a booking taken on a channel TravelLine
 * doesn't integrate with). That kind of block is invisible to
 * travelline.ts's booking sync — and therefore to the staff app and to the
 * Avito agent — because there's no reservation to read. TravelLine's own
 * Search API, however, reports the true number of sellable units for a
 * given night regardless of *why* they're unavailable.
 *
 * Approach: for each of the next N nights, call the Search API to get the
 * real `availability` count per room type, subtract how many units are
 * already accounted for by real bookings we know about, and represent the
 * remaining shortfall as synthetic "quota block" documents in `bookings`
 * (tagged created_by = "travelline_quota"). Because the site's own
 * calculateAvailability() and the staff Dashboard both just count/render
 * whatever is in `bookings`, they pick these up automatically — no changes
 * needed there. A Telegram message summarizes any change so the change is
 * never silent.
 */

import {
  deleteBookingDoc,
  findBookingsInCabinRange,
  setBookingDoc
} from './firestore';
import {
  HOUSE_TYPE_CABIN_RANGE,
  ROOM_TYPE_TO_HOUSE_TYPE,
  TL_API_BASE,
  TOTAL_CABINS,
  datesOverlap,
  getTravelLineToken,
  sendTelegramNotification,
  type TravelLineEnv
} from './travelline';

const QUOTA_SOURCE = 'travelline_quota';
const DEFAULT_DAYS_AHEAD = 21;

export interface TravelLineAvailabilityEnv extends TravelLineEnv {
  TRAVELLINE_AVAILABILITY_DAYS_AHEAD?: string;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

interface SearchRoomStay {
  roomType: { id: string };
  availability: number;
}

/**
 * Real, live availability per house_type for a single night — the minimum
 * across any rate plans reporting for the same room type, and 0 for a
 * house type TravelLine's response omits entirely (fully sold everywhere).
 */
async function fetchNightAvailability(
  env: TravelLineAvailabilityEnv,
  token: string,
  date: string
): Promise<Record<string, number>> {
  const url = new URL(`${TL_API_BASE}/search/v1/properties/${env.TRAVELLINE_PROPERTY_ID}/room-stays`);
  url.searchParams.set('arrivalDate', date);
  url.searchParams.set('departureDate', addDays(date, 1));
  url.searchParams.set('adults', '1');

  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`TravelLine search failed for ${date}: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { roomStays?: SearchRoomStay[] };
  const result: Record<string, number> = {};
  for (const houseType of Object.keys(HOUSE_TYPE_CABIN_RANGE)) result[houseType] = 0;

  for (const stay of data.roomStays || []) {
    const houseType = ROOM_TYPE_TO_HOUSE_TYPE[stay.roomType.id];
    if (!houseType) continue;
    result[houseType] = houseType in result ? Math.min(result[houseType], stay.availability) : stay.availability;
  }

  return result;
}

interface ChangeLogEntry {
  date: string;
  houseType: string;
  from: number;
  to: number;
}

/**
 * Picks cabin_id numbers for new quota-block docs, avoiding whatever is
 * already occupied (real or phantom) that same night in `cached`.
 */
function pickFreeCabinIds(
  houseType: string,
  date: string,
  count: number,
  cached: Array<{ cabin_id: number; check_in: string; check_out: string; created_by: string }>
): number[] {
  const [min, max] = HOUSE_TYPE_CABIN_RANGE[houseType];
  const occupied = new Set(
    cached
      .filter((b) => datesOverlap(date, addDays(date, 1), b.check_in, b.check_out))
      .map((b) => b.cabin_id)
  );

  const picked: number[] = [];
  for (let id = min; id <= max && picked.length < count; id++) {
    if (!occupied.has(id)) picked.push(id);
  }
  // Range exhausted (shouldn't normally happen — would mean this house type
  // is oversold across every channel): reuse the last id rather than skip
  // creating the block, so the shortfall is still visible somewhere.
  while (picked.length < count) picked.push(max);
  return picked;
}

export async function syncTravelLineAvailability(
  env: TravelLineAvailabilityEnv
): Promise<{ nightsChecked: number; changes: ChangeLogEntry[] }> {
  const daysAhead = Number(env.TRAVELLINE_AVAILABILITY_DAYS_AHEAD) || DEFAULT_DAYS_AHEAD;
  const token = await getTravelLineToken(env);

  // One query per house-type cabin range for the whole run (not per night) —
  // Workers cap subrequests per invocation, and this data changes rarely
  // enough within a single run that a snapshot at the start is accurate.
  const cabinRangeCache = new Map<
    string,
    Array<{ cabin_id: number; check_in: string; check_out: string; created_by: string }>
  >();
  for (const [houseType, [min, max]] of Object.entries(HOUSE_TYPE_CABIN_RANGE)) {
    cabinRangeCache.set(houseType, await findBookingsInCabinRange(env, min, max));
  }

  const today = new Date().toISOString().slice(0, 10);
  const changes: ChangeLogEntry[] = [];

  for (let i = 0; i < daysAhead; i++) {
    const date = addDays(today, i);
    const nightEnd = addDays(date, 1);
    const availability = await fetchNightAvailability(env, token, date);

    for (const houseType of Object.keys(HOUSE_TYPE_CABIN_RANGE)) {
      const total = TOTAL_CABINS[houseType];
      const cached = cabinRangeCache.get(houseType) || [];
      const overlapping = cached.filter((b) => datesOverlap(date, nightEnd, b.check_in, b.check_out));

      const realOccupied = overlapping.filter((b) => b.created_by !== QUOTA_SOURCE).length;
      const existingQuotaBlocks = overlapping.filter((b) => b.created_by === QUOTA_SOURCE);

      const impliedOccupied = Math.max(0, total - (availability[houseType] ?? 0));
      const targetQuotaBlocks = Math.min(total, Math.max(0, impliedOccupied - realOccupied));
      const delta = targetQuotaBlocks - existingQuotaBlocks.length;

      if (delta === 0) continue;

      changes.push({ date, houseType, from: existingQuotaBlocks.length, to: targetQuotaBlocks });

      if (delta > 0) {
        const newCabinIds = pickFreeCabinIds(houseType, date, delta, cached);
        for (const cabinId of newCabinIds) {
          const docId = `tlquota_${date}_${cabinId}`;
          await setBookingDoc(env, docId, {
            cabin_id: cabinId,
            house_type: houseType,
            check_in: date,
            check_out: nightEnd,
            guest_last_name: 'Блокировка канала (TravelLine)',
            guest_phone: '',
            prepayment: 0,
            total_price: 0,
            remaining_balance: 0,
            is_fully_paid: false,
            created_by: QUOTA_SOURCE,
            created_by_name: 'TravelLine (квота)',
            comment: 'Автосинхронизация квоты TravelLine — не привязано к конкретной брони'
          });
          cached.push({ cabin_id: cabinId, check_in: date, check_out: nightEnd, created_by: QUOTA_SOURCE });
        }
      } else {
        const toRemove = existingQuotaBlocks
          .sort((a, b) => b.cabin_id - a.cabin_id)
          .slice(0, -delta);
        for (const block of toRemove) {
          await deleteBookingDoc(env, `tlquota_${date}_${block.cabin_id}`);
          const idx = cached.indexOf(block);
          if (idx !== -1) cached.splice(idx, 1);
        }
      }
    }
  }

  if (changes.length > 0) {
    const lines = changes
      .map((c) => `${c.date} — ${c.houseType}: ${c.from} → ${c.to} заблокировано по квоте`)
      .join('\n');
    await sendTelegramNotification(
      env,
      `🔄 Синхронизация квоты TravelLine — обнаружены изменения доступности:\n\n${lines}`
    );
  }

  return { nightsChecked: daysAhead, changes };
}
