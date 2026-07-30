import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  where
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

const COMMENTS_COLLECTION = FIRESTORE_PATHS.WATCH_EARN.COMMENTS;

export async function getComments(contentId: string, callback: (comments: any[]) => void) {
  const q = query(collection(db, COMMENTS_COLLECTION), where("contentId", "==", contentId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}

export async function addComment(contentId: string, userId: string, userName: string, text: string, moderationConfig: any) {
  // Simple Client-side moderation
  if (moderationConfig.autoReject) {
    const isAbusive = moderationConfig.blockedWords.some((word: string) => text.toLowerCase().includes(word.toLowerCase()));
    if (isAbusive) throw new Error("Comment rejected due to content moderation.");
  }

  await addDoc(collection(db, COMMENTS_COLLECTION), {
    contentId,
    userId,
    userName,
    text,
    createdAt: serverTimestamp(),
  });
}

export async function deleteComment(commentId: string) {
  await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
}
