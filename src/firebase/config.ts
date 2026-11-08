import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const env = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

export const isFirebaseConfigured = Boolean(
  env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  env.NEXT_PUBLIC_FIREBASE_APP_ID
);

// Local preview fallback only. These values are deliberately non-secret and do not
// connect to the real JEMBEE PLAY Firebase project. Real auth/data requires .env.local.
const previewConfig = {
  apiKey: "local-preview-placeholder-api-key",
  authDomain: "localhost",
  projectId: "jembee-shorts-local-preview",
  storageBucket: "jembee-shorts-local-preview.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:localpreview",
};

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY || previewConfig.apiKey,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || previewConfig.authDomain,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || previewConfig.projectId,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || previewConfig.storageBucket,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || previewConfig.messagingSenderId,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID || previewConfig.appId,
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
