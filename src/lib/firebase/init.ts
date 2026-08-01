/**
 * Initialize Firebase on app startup
 */
import { getDb } from './config';

export async function initializeFirebaseOnStartup() {
  try {
    console.log('🔥 Initializing Firebase...');
    await getDb();
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed (may be offline):', error);
    // Don't throw - app should work in offline mode too
  }
}
