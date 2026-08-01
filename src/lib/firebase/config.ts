import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore
} from 'firebase/firestore';

// Firebase config from staff app (nimble-cairn-ssx2c project)
const firebaseConfig = {
  projectId: 'nimble-cairn-ssx2c',
  appId: '1:1021219209449:web:71bdb1bb7439ea207cf078',
  apiKey: 'AIzaSyBAgqdJMxuAEFTPSSHvpUkIkVV0712X7vA',
  authDomain: 'nimble-cairn-ssx2c.firebaseapp.com',
  storageBucket: 'nimble-cairn-ssx2c.firebasestorage.app',
  messagingSenderId: '1021219209449',
  measurementId: ''
};

let firestoreInstance: Firestore | null = null;
let appInstance: any = null;

async function initFirebase() {
  try {
    appInstance = initializeApp(firebaseConfig);
    const databaseId = 'ai-studio-3b154fdf-8079-4a99-b49e-8c7d575cecad';

    firestoreInstance = initializeFirestore(appInstance, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      }),
      experimentalForceLongPolling: true
    }, databaseId);

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
