/**
 * Debug utilities for Firebase connection
 */
import { getDb } from './config';
import { collection, query, getDocs } from 'firebase/firestore';

export async function debugFirebaseConnection() {
  try {
    console.log('🔍 Testing Firestore connection...');
    const db = await getDb();

    // Try to read bookings collection
    const q = query(collection(db, 'bookings'));
    const snapshot = await getDocs(q);

    console.log(`✅ Firebase connection OK! Found ${snapshot.size} bookings`);

    // Log first 3 bookings for debugging
    snapshot.docs.slice(0, 3).forEach(doc => {
      console.log('Booking:', doc.id, doc.data());
    });

    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
}
