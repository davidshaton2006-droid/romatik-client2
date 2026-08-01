import { BookingPayload } from '../../types';
import { getDb } from './config';
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  Timestamp,
  Query,
  Unsubscribe
} from 'firebase/firestore';

/**
 * Convert BookingPayload to Firestore format
 */
function prepareBookingForFirestore(booking: BookingPayload) {
  return {
    cabin_id: 1, // Will be determined by availability check
    house_type: booking.cabinType === 'two_seat' ? 'Двухместный' : 'Трехместный',
    check_in: booking.checkIn,
    check_out: booking.checkOut,
    guest_last_name: booking.guestName,
    guest_phone: booking.guestPhone,
    prepayment: booking.prepaymentAmount,
    total_price: booking.totalPrice,
    remaining_balance: booking.totalPrice - booking.prepaymentAmount,
    is_fully_paid: false,
    created_at: Timestamp.now(),
    created_by: 'client_web',
    created_by_name: booking.guestName,
    comment: booking.specialRequests || '',
    payment_id: booking.id, // Link to payment
    payment_status: 'pending',
    source: 'website'
  };
}

/**
 * Save booking to Firestore
 */
export async function saveBookingToFirestore(booking: BookingPayload): Promise<string> {
  try {
    const db = await getDb();
    const bookingsRef = collection(db, 'bookings');
    const firestoreBooking = prepareBookingForFirestore(booking);

    const docRef = await addDoc(bookingsRef, firestoreBooking);
    console.log('✅ Booking saved to Firestore:', docRef.id);

    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving booking to Firestore:', error);
    throw error;
  }
}

/**
 * Listen to bookings from Firestore
 */
export function listenToBookings(callback: (bookings: any[]) => void): Unsubscribe {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const db = await getDb();
        const q = query(collection(db, 'bookings'));

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const bookings = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            callback(bookings);
          },
          (error) => {
            console.error('❌ Error listening to bookings:', error);
            reject(error);
          }
        );

        resolve(unsubscribe);
      } catch (error) {
        reject(error);
      }
    })();
  }) as any;
}

/**
 * Get bookings that overlap with given date range
 */
export function filterBookingsByDateRange(
  bookings: any[],
  checkIn: string,
  checkOut: string
): any[] {
  const checkInTime = new Date(checkIn).getTime();
  const checkOutTime = new Date(checkOut).getTime();

  return bookings.filter(booking => {
    const bookingCheckIn = new Date(booking.check_in).getTime();
    const bookingCheckOut = new Date(booking.check_out).getTime();

    // Overlaps if: checkIn < bookingCheckOut AND checkOut > bookingCheckIn
    return checkInTime < bookingCheckOut && checkOutTime > bookingCheckIn;
  });
}

/**
 * Calculate available cabins
 */
export function calculateAvailability(
  bookings: any[],
  checkIn: string,
  checkOut: string
): { availableDouble: number; availableTriple: number; occupiedDoubleCabins: number[]; occupiedTripleCabins: number[] } {
  const totalDouble = 7; // 1-7 are 2-seater
  const totalTriple = 10; // 8-17 are 3-seater

  const overlappingBookings = filterBookingsByDateRange(bookings, checkIn, checkOut);

  const occupiedDoubleCabins = overlappingBookings
    .filter(b => b.house_type === 'Двухместный')
    .map(b => b.cabin_id);

  const occupiedTripleCabins = overlappingBookings
    .filter(b => b.house_type === 'Трехместный')
    .map(b => b.cabin_id);

  return {
    availableDouble: totalDouble - occupiedDoubleCabins.length,
    availableTriple: totalTriple - occupiedTripleCabins.length,
    occupiedDoubleCabins,
    occupiedTripleCabins
  };
}

/**
 * Find first available cabin of given type
 */
export function findAvailableCabin(
  bookings: any[],
  cabinType: 'Двухместный' | 'Трехместный',
  checkIn: string,
  checkOut: string
): number | null {
  const { occupiedDoubleCabins, occupiedTripleCabins } = calculateAvailability(bookings, checkIn, checkOut);

  if (cabinType === 'Двухместный') {
    for (let i = 1; i <= 7; i++) {
      if (!occupiedDoubleCabins.includes(i)) return i;
    }
  } else if (cabinType === 'Трехместный') {
    for (let i = 8; i <= 17; i++) {
      if (!occupiedTripleCabins.includes(i)) return i;
    }
  }

  return null;
}
