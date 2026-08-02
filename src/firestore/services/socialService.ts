import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  where
, updateDoc, increment} from "firebase/firestore";
import { getApp } from "firebase/app";
import { auth, db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

const COMMENTS_COLLECTION = FIRESTORE_PATHS.WATCH_EARN.COMMENTS;

export interface ChatComment {
  id: string;
  contentId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

export async function getComments(contentId: string, callback: (comments: any[]) => void) {
  const q = query(collection(db, COMMENTS_COLLECTION), where("contentId", "==", contentId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}

export async function addComment(contentId: string, userId: string, userName: string, text: string, moderationConfig: any) {
  const app = getApp();
  console.log("DEBUG: addComment trace", {
      contentId,
      passedUserId: userId,
      authUid: auth.currentUser?.uid,
      projectId: app.options.projectId
  });

  // Simple Client-side moderation
  if (moderationConfig.autoReject) {
    const isAbusive = moderationConfig.blockedWords.some((word: string) => text.toLowerCase().includes(word.toLowerCase()));
    if (isAbusive) {
      console.log("DEBUG: addComment rejected by moderation");
      throw new Error("Comment rejected due to content moderation.");
    }
  }

  try {
    console.log("DEBUG: Attempting addDoc", { COMMENTS_COLLECTION });
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
      contentId,
      userId,
      userName,
      text,
      createdAt: serverTimestamp(),
    });

  await updateDoc(doc(db, "watchVideos", contentId), {
    comments: increment(1),
  });
    console.log("DEBUG: addDoc success", { id: docRef.id });
  } catch (error: any) {
    console.error("DEBUG: addDoc error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
        error
    });
    throw error;
  }
}

export async function deleteComment(commentId: string) {
  await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
}
