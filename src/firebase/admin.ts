import { cert, getApp, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const ADMIN_APP_NAME = "jembee-admin";
let cachedApp: App | null = null;

const getAdminApp = () => {
  if (cachedApp) return cachedApp;

  // 1. Try to get the existing named app
  try {
    cachedApp = getApp(ADMIN_APP_NAME);
    return cachedApp;
  } catch {
    // App not initialized yet, proceed to initialize
  }

  // 2. Attempt initialization with env variables
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    cachedApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    }, ADMIN_APP_NAME);

    return cachedApp;
  }

  // 3. Fallback to Service Account JSON
  const rawCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;

  if (!rawCredentials) {
    throw new Error("Firebase Admin credentials are not configured");
  }

  let credentials: {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };

  try {
    credentials = JSON.parse(rawCredentials);
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS contains invalid JSON"
    );
  }

  if (
    !credentials.project_id ||
    !credentials.client_email ||
    !credentials.private_key
  ) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS is missing required Firebase fields"
    );
  }

  cachedApp = initializeApp({
    credential: cert({
      projectId: credentials.project_id,
      clientEmail: credentials.client_email,
      privateKey: credentials.private_key.replace(/\\n/g, "\n"),
    }),
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      `${credentials.project_id}.appspot.com`,
  }, ADMIN_APP_NAME);

  return cachedApp;
};

export const getAdminDb = () => getFirestore(getAdminApp());
export const getAdminAuth = () => getAuth(getAdminApp());
