import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

const CHATS_COLLECTION = FIRESTORE_PATHS.ADMIN_CHAT.CHATS;

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
  readBy: Record<string, any>;
}

export async function sendMessage(chatId: string, senderId: string, senderName: string, text: string) {
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  const messagesRef = collection(chatRef, FIRESTORE_PATHS.ADMIN_CHAT.MESSAGES);

  await runTransaction(db, async (transaction) => {
    transaction.set(doc(messagesRef), {
      senderId,
      senderName,
      text,
      createdAt: serverTimestamp(),
      readBy: { [senderId]: serverTimestamp() }
    });

    transaction.update(chatRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function editMessage(chatId: string, messageId: string, newText: string) {
  const msgRef = doc(db, CHATS_COLLECTION, chatId, FIRESTORE_PATHS.ADMIN_CHAT.MESSAGES, messageId);
  await updateDoc(msgRef, { text: newText, updatedAt: serverTimestamp(), edited: true });
}

export async function deleteMessage(chatId: string, messageId: string) {
  const msgRef = doc(db, CHATS_COLLECTION, chatId, FIRESTORE_PATHS.ADMIN_CHAT.MESSAGES, messageId);
  await deleteDoc(msgRef);
}

export async function markAsRead(chatId: string, messageId: string, userId: string) {
  const msgRef = doc(db, CHATS_COLLECTION, chatId, FIRESTORE_PATHS.ADMIN_CHAT.MESSAGES, messageId);
  await updateDoc(msgRef, { [`readBy.${userId}`]: serverTimestamp() });
}

export async function updateTypingStatus(chatId: string, userId: string, isTyping: boolean) {
  const typingRef = doc(db, FIRESTORE_PATHS.ADMIN_CHAT.TYPING_STATUS, chatId);
  await setDoc(typingRef, { [userId]: isTyping }, { merge: true });
}

export async function updatePresence(uid: string, online: boolean) {
  const presenceRef = doc(db, FIRESTORE_PATHS.ADMIN_CHAT.USER_PRESENCE, uid);
  await setDoc(presenceRef, {
    online,
    lastSeen: serverTimestamp(),
  }, { merge: true });
}
