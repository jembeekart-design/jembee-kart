import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

const CHATS_COLLECTION = FIRESTORE_PATHS.ADMIN_CHAT.CHATS;

/**
 * Sends a message and atomically updates chat metadata.
 */
export async function sendMessage(chatId: string, sender: "admin" | "user", text: string) {
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  const messagesRef = collection(chatRef, FIRESTORE_PATHS.ADMIN_CHAT.MESSAGES);

  await runTransaction(db, async (transaction) => {
    // Add the message
    const messageDocRef = doc(messagesRef);
    transaction.set(messageDocRef, {
      sender,
      text,
      createdAt: serverTimestamp(),
    });

    // Update chat metadata
    transaction.update(chatRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Unread count increment could be added here
    });
  });
}

/**
 * Updates user presence status.
 */
export async function updatePresence(uid: string, online: boolean) {
  const presenceRef = doc(db, FIRESTORE_PATHS.ADMIN_CHAT.PRESENCE, uid);
  await setDoc(presenceRef, {
    online,
    lastSeen: serverTimestamp(),
  }, { merge: true });
}

/**
 * Updates typing status for a specific chat.
 */
export async function setTyping(chatId: string, uid: string, isTyping: boolean) {
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  await updateDoc(chatRef, {
    [`typingStatus.${uid}`]: isTyping,
  });
}
