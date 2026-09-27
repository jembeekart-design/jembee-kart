import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const app =
  getApps().length > 0
    ? getApps()[0]
    : (() => {
        const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
          ?.replace(/\\n/g, "\n")
          .trim();

        if (projectId && clientEmail && privateKey) {
          return initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey,
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          });
        }

        const rawCredentials =
          process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS?.trim();

        if (!rawCredentials) {
          throw new Error(
            "Firebase Admin credentials are not configured. Set FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_CREDENTIALS."
          );
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
            "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS contains invalid JSON."
          );
        }

        if (
          typeof credentials.project_id !== "string" ||
          typeof credentials.client_email !== "string" ||
          typeof credentials.private_key !== "string"
        ) {
          throw new Error(
            "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS must contain string project_id, client_email and private_key."
          );
        }

        return initializeApp({
          credential: cert({
            projectId: credentials.project_id,
            clientEmail: credentials.client_email,
            privateKey: credentials.private_key.replace(/\\n/g, "\n"),
          }),
          storageBucket:
            process.env.FIREBASE_STORAGE_BUCKET ||
            `${credentials.project_id}.appspot.com`,
        });
      })();

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);

export default app;
