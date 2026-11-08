import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

const SESSIONS_COLLECTION = FIRESTORE_PATHS.ADMIN_CHAT.CALL_SESSIONS;
const INVITATIONS_COLLECTION = FIRESTORE_PATHS.ADMIN_CHAT.CALL_INVITATIONS;

export async function createCall(callerId: string, receiverId: string, type: "voice" | "video") {
  const sessionRef = await addDoc(collection(db, SESSIONS_COLLECTION), {
    callerId,
    receiverId,
    type,
    status: "initiating",
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, INVITATIONS_COLLECTION), {
    sessionId: sessionRef.id,
    receiverId,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return sessionRef.id;
}

export async function updateCallStatus(sessionId: string, status: "accepted" | "rejected" | "ended") {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  await updateDoc(sessionRef, { status, updatedAt: serverTimestamp() });
}
