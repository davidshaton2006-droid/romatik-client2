import { BookingPayload, Booking, SyncLog } from '../types';
import { saveBookingToFirestore, listenToBookings, calculateAvailability as calcAvailabilityFromFirestore } from '../lib/firebase/bookings';

const LOCAL_STORAGE_KEY_BOOKINGS = 'romantic_resort_bookings_v3';
const LOCAL_STORAGE_KEY_LOGS = 'romantic_resort_logs_v3';

function getInitialBookings(): Booking[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BOOKINGS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  const sampleBookings: Booking[] = [
    {
      id: 'book-101',
      cabinType: 'two_seat',
      cabinsCount: 1,
      guestName: 'Михаил Соколов',
      guestPhone: '+7 (913) 456-78-90',
      hasThirdAdult: false,
      checkIn: '2026-08-01',
      checkOut: '2026-08-03',
      totalPrice: 18000,
      prepaymentAmount: 9000,
      status: 'pending_staff_approval',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      source: 'website'
    },
    {
      id: 'book-102',
      cabinType: 'three_seat',
      cabinsCount: 2,
      guestName: 'Елена Воронова',
      guestPhone: '+7 (923) 789-12-34',
      hasThirdAdult: true,
      checkIn: '2026-08-05',
      checkOut: '2026-08-07',
      totalPrice: 38000,
      prepaymentAmount: 19000,
      status: 'pending_staff_approval',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      source: 'website'
    }
  ];
  localStorage.setItem(LOCAL_STORAGE_KEY_BOOKINGS, JSON.stringify(sampleBookings));
  return sampleBookings;
}

function getInitialLogs(): SyncLog[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  const defaultLogs: SyncLog[] = [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      type: 'WEBHOOK_DISPATCHED',
      message: 'Система синхронизации API HUB Персонала готова к приему бронирований sendBookingToStaffApp()'
    }
  ];
  localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(defaultLogs));
  return defaultLogs;
}

// Send booking to Staff App via Firestore
export async function sendBookingToStaffApp(bookingData: BookingPayload): Promise<BookingPayload> {
  console.log('📡 Sending booking to Firestore (Staff App):', bookingData);

  try {
    // Save to Firestore
    const firestoreId = await saveBookingToFirestore(bookingData);

    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'CLIENT_BOOKING_POSTED',
      message: `✅ Бронирование #${bookingData.id} [${bookingData.cabinType}, ${bookingData.cabinsCount} шт.] успешно отправлено в Firestore!`,
      payload: { ...bookingData, firestoreId }
    });

    return bookingData;
  } catch (err) {
    console.warn('❌ Firestore error, falling back to local storage:', err);

    // Fallback local storage sync
    const current = getInitialBookings();
    const updated = [bookingData as Booking, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY_BOOKINGS, JSON.stringify(updated));

    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'CLIENT_BOOKING_POSTED',
      message: `⚠️ Бронирование #${bookingData.id} (${bookingData.guestName}) сохранено в очередь (offline mode)!`,
      payload: bookingData
    });

    throw err;
  }
}

export async function fetchBookings(): Promise<Booking[]> {
  try {
    const res = await fetch('/api/bookings');
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(LOCAL_STORAGE_KEY_BOOKINGS, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    // fallback
  }
  return getInitialBookings();
}

/**
 * Listen to Firestore bookings in real-time
 * Returns unsubscribe function
 */
export async function listenToFirestoreBookings(
  callback: (bookings: Booking[]) => void
): Promise<() => void> {
  try {
    const unsubscribe = await listenToBookings((firestoreBookings) => {
      // Convert Firestore format to Booking format
      const convertedBookings: Booking[] = firestoreBookings.map((fb: any) => ({
        id: fb.id,
        cabinType: fb.house_type === 'Двухместный' ? 'two_seat' : 'three_seat',
        cabinsCount: 1,
        guestName: fb.guest_last_name,
        guestPhone: fb.guest_phone || '',
        hasThirdAdult: false,
        checkIn: fb.check_in,
        checkOut: fb.check_out,
        totalPrice: fb.total_price || 0,
        prepaymentAmount: fb.prepayment || 0,
        status: fb.payment_status === 'success' ? 'confirmed' : 'pending_staff_approval',
        createdAt: fb.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        source: 'firestore'
      }));

      callback(convertedBookings);
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up Firestore listener:', error);
    throw error;
  }
}

export function fetchSyncLogs(): SyncLog[] {
  return getInitialLogs();
}

function addLog(log: SyncLog) {
  const current = getInitialLogs();
  const updated = [log, ...current].slice(0, 50);
  localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(updated));
}

// Dynamic Availability Calculation (from Bookings)
export function calculateAvailability(
  bookings: Booking[],
  checkIn: string,
  checkOut: string
): { availableDouble: number; availableTriple: number } {
  const totalDouble = 10; // Cabins 1-10 (двухместные)
  const totalTriple = 10;  // Cabins 11-20 (трёхместные)

  if (!checkIn || !checkOut) {
    return { availableDouble: totalDouble, availableTriple: totalTriple };
  }

  const reqStart = new Date(checkIn).getTime();
  const reqEnd = new Date(checkOut).getTime();

  // Validate dates
  if (isNaN(reqStart) || isNaN(reqEnd) || reqStart >= reqEnd) {
    return { availableDouble: totalDouble, availableTriple: totalTriple };
  }

  let occupiedDouble = 0;
  let occupiedTriple = 0;

  bookings.forEach((b) => {
    // Skip cancelled bookings
    if (b.status === 'cancelled' || b.status === 'pending_staff_approval') return;

    const bStart = new Date(b.checkIn).getTime();
    const bEnd = new Date(b.checkOut).getTime();

    // Check overlap: booking overlaps if checkIn < bEnd AND checkOut > bStart
    if (bStart < reqEnd && bEnd > reqStart) {
      if (b.cabinType === 'two_seat') {
        occupiedDouble += b.cabinsCount || 1;
      } else if (b.cabinType === 'three_seat') {
        occupiedTriple += b.cabinsCount || 1;
      }
    }
  });

  return {
    availableDouble: Math.max(0, totalDouble - occupiedDouble),
    availableTriple: Math.max(0, totalTriple - occupiedTriple)
  };
}
