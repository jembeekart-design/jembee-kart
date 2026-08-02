import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  serverTimestamp,
  query,
  limit
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { auth } from "@/firebase/config";

/**
 * Initializes the Admin Chat Firestore collections and documents if empty.
 */
export async function initializeAdminChat() {
  try {
    const chatsCollection = collection(db, FIRESTORE_PATHS.ADMIN_CHAT.CHATS);
    const chatsSnapshot = await getDocs(query(chatsCollection, limit(1)));

    if (chatsSnapshot.empty) {
      console.log("🌱 Initializing Admin Chat...");

      // Get an existing user for the chat linkage
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(query(usersCollection, limit(1)));
      const userId = !usersSnapshot.empty ? usersSnapshot.docs[0].id : "anonymous";
      const userName = !usersSnapshot.empty ? (usersSnapshot.docs[0].data() as any).name || "User" : "User";

      // 1. Create initial chat document
      const chatRef = await addDoc(chatsCollection, {
        name: userName,
        participants: [userId, auth.currentUser?.uid || "admin"],
        lastMessage: "Welcome to JembeeKart Chat!",
        lastMessageAt: serverTimestamp(),
        online: true,
        updatedAt: serverTimestamp(),
      });

      // 2. Create initial message
      await addDoc(collection(chatRef, FIRESTORE_PATHS.ADMIN_CHAT.MESSAGES), {
        senderId: "system",
        senderName: "System",
        text: "Welcome to JembeeKart Chat!",
        createdAt: serverTimestamp(),
      });

      console.log("✅ Admin Chat collections initialized.");
    }
  } catch (error) {
    console.error("❌ Failed to initialize Admin Chat:", error);
  }
}
