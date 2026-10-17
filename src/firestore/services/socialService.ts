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
  where,
  increment,
  getDocs
} from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { getModerationSettings } from "@/services/moderationService";

const COMMENTS_COLLECTION = FIRESTORE_PATHS.WATCH_EARN.COMMENTS;

export interface ChatComment {
  id: string;
  contentId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
  status?: string;
  likes?: number;
  likedByCurrentUser?: boolean;
}

export async function getComments(contentId: string, userId: string, callback: (comments: any[]) => void) {
  // Requirement 6: Only approved comments appear in UI.
  const q = query(
      collection(db, COMMENTS_COLLECTION), 
      where("contentId", "==", contentId),
      where("status", "==", "approved"),
      orderBy("createdAt", "asc")
  );

  const qLikes = query(collection(db, "videoCommentLikes"), where("userId", "==", userId));

  let commentsData: any[] = [];
  let likedCommentIds = new Set<string>();

  function update() {
    callback(commentsData.map(doc => ({ 
      ...doc,
      likedByCurrentUser: likedCommentIds.has(doc.id)
    })));
  }

  const unsubComments = onSnapshot(q, (snapshot) => {
      commentsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data, likes: data.likes || 0 };
      });
      update();
  });

  const unsubLikes = onSnapshot(qLikes, (snapshot) => {
      likedCommentIds = new Set(snapshot.docs.map(doc => doc.data().commentId));
      update();
  });

  return () => {
    unsubComments();
    unsubLikes();
  };
}

export async function addComment(
  contentId: string,
  userId: string,
  userName: string,
  text: string
) {
  const currentUser = auth.currentUser;

  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Please sign in before commenting.");
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error("Comment cannot be empty.");
  }

  const token = await currentUser.getIdToken();

  const response = await fetch("/api/shorts/comments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      videoId: contentId,
      text: trimmedText,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success !== true || !result.comment?.id) {
    throw new Error(
      typeof result.message === "string"
        ? result.message
        : "Failed to submit comment."
    );
  }

  // Keep the existing caller contract: CommentDrawer uses commentRef.id.
  return { id: result.comment.id };
}

export async function deleteComment(commentId: string) {
  await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
}
