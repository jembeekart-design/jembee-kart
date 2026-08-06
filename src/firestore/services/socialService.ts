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
import { db } from "@/firebase/config";
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
}

export async function getComments(contentId: string, callback: (comments: any[]) => void) {
  // Requirement 6: Only approved comments appear in UI.
  // Note: Old comments without status might not show up.
  const q = query(
      collection(db, COMMENTS_COLLECTION), 
      where("contentId", "==", contentId),
      where("status", "==", "approved"),
      orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}

export async function addComment(contentId: string, userId: string, userName: string, text: string) {
  // Requirement 1: Load moderation settings from Firestore.
  const settings = await getModerationSettings();
  
  if (!settings.commentsEnabled) throw new Error("Comments are currently disabled by administrators.");

  // Requirement 2, 3: Check against blockedWords and profanity filter.
  const textToCheck = settings.caseInsensitive ? text.toLowerCase() : text;

  // Requirement 2: Whitelist check
  const whitelisted = settings.allowedWords.some(w => {
    const word = settings.caseInsensitive ? w.toLowerCase() : w;
    return textToCheck.includes(word);
  });

  if (!whitelisted && settings.enabled && settings.blockedWords.length > 0) {
    const isBlocked = settings.blockedWords.some(word => {
      const bWord = settings.caseInsensitive ? word.toLowerCase() : word;
      return settings.blockPartialMatch 
        ? textToCheck.includes(bWord) 
        : textToCheck.split(/\s+/).includes(bWord);
    });

    // Requirement 4: If blocked: Do NOT save comment.
    if (isBlocked) {
        throw new Error("Please avoid abusive language.");
    }
  }

  // Requirement 5: If autoApprove=false: Save status="pending".
  const isApproved = settings.autoApproveComments;

  const commentRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
    contentId,
    userId,
    userName,
    text,
    createdAt: serverTimestamp(),
    status: isApproved ? 'approved' : 'pending',
  });

  // Requirement 5: Create moderation queue entry.
  if (!isApproved) {
     await addDoc(collection(db, "videoCommentReports"), {
        commentId: commentRef.id,
        contentId,
        userId,
        userName,
        text,
        status: "pending",
        createdAt: serverTimestamp(),
        reason: "auto-moderation-pending"
     });
  }

  // Also increment the aggregated comments counter on the video document so the feed shows updated counts
  try {
    await updateDoc(doc(db, "watchEarnVideos", contentId), {
      comments: increment(1)
    });
  } catch (err) {
    // If increment fails, do not throw — comment is stored; log for debugging.
    console.error("Failed to increment video comments counter:", err);
  }

  return commentRef;
}

export async function deleteComment(commentId: string) {
  await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
}
