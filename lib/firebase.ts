import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Determine configuration status
const isConfigured = 
  typeof window !== 'undefined'
    ? !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    : !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY; // keep it consistent

let app;
let auth: any = null;
let db: any = null;

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully.');
  } catch (error) {
    console.error('Firebase initialization error, running in simulated mode:', error);
  }
} else {
  console.log('Firebase credentials not found. AuraAI will run in Simulated Auth & Firestore Mode.');
}

export const IS_MOCK = !isConfigured || !auth || !db;
export { auth, db };
