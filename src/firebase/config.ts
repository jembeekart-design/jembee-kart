import {
  initializeApp,
  getApps,
  getApp
} from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/* FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

/* APP */
// Yahan "export" keyword add karein
export const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

/* SERVICES */
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Default export ki zaroorat nahi hai agar aap named exports use kar rahe hain, 
// lekin agar project mein kahin 'import app from...' use ho raha hai, 
// toh aap niche wali line rakh sakte hain:
export default app;
