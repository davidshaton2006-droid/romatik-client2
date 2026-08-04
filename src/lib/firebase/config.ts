import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore
} from 'firebase/firestore';

// Firebase config — shared with the staff app (romantik-client project)
const firebaseConfig = {
  projectId: 'romantik-client',
  appId: '1:554669192783:web:7d5b3fb46c6f254a2e9c3a',
  apiKey: 'AIzaSyA51Io4f_wvlnHlxm4CGRv0YavokXV4VJI',
  authDomain: 'romantik-client.firebaseapp.com',
  storageBucket: 'romantik-client.firebasestorage.app',
  messagingSenderId: '554669192783',
  measurementId: 'G-RZJCF1C8BQ'
};

let firestoreInstance: Firestore | null = null;
let appInstance: any = null;

async function initFirebase() {
  try {
    appInstance = initializeApp(firebaseConfig);

    firestoreInstance = initializeFirestore(appInstance, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      }),
      experimentalForceLongPolling: true
    });

    console.log('✅ Firebase initialized successfully');
    return firestoreInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    throw error;
  }
}

export const getFirebaseApp = async () => {
  if (!appInstance) {
    await initFirebase();
  }
  return appInstance;
};

export const getDb = async () => {
  if (firestoreInstance) return firestoreInstance;
  return await initFirebase();
};
