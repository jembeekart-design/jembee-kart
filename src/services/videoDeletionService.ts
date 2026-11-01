import type { Firestore, DocumentReference } from "firebase-admin/firestore";

const WRITE_BATCH_SIZE = 400;

async function deleteByField(db: Firestore, collectionName: string, field: string, value: string) {
  let deleted = 0;
  while (true) {
    const page = await db.collection(collectionName).where(field, "==", value).limit(WRITE_BATCH_SIZE).get();
    if (page.empty) break;
    const batch = db.batch();
    page.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += page.size;
    if (page.size < WRITE_BATCH_SIZE) break;
  }
  return deleted;
}

async function archiveByField(db: Firestore, collectionName: string, field: string, value: string) {
  let archived = 0;
  while (true) {
    const page = await db.collection(collectionName).where(field, "==", value).limit(WRITE_BATCH_SIZE).get();
    if (page.empty) break;
    const batch = db.batch();
    page.docs.forEach((doc) => batch.update(doc.ref, {
      videoDeleted: true,
      status: "archived_video_deleted",
      videoId: null,
      contentId: null,
      archivedAt: new Date(),
    }));
    await batch.commit();
    archived += page.size;
    if (page.size < WRITE_BATCH_SIZE) break;
  }
  return archived;
}

export async function cleanupVideoRecords(db: Firestore, videoId: string, videoRef: DocumentReference) {
  let deletedComments = 0;
  // Remove current comments and their likes in bounded batches.
  while (true) {
    const page = await db.collection("comments").where("contentId", "==", videoId).limit(WRITE_BATCH_SIZE).get();
    if (page.empty) break;
    const commentIds = page.docs.map((doc) => doc.id);
    for (let i = 0; i < commentIds.length; i += 30) {
      const ids = commentIds.slice(i, i + 30);
      while (true) {
        const likes = await db.collection("videoCommentLikes").where("commentId", "in", ids).limit(WRITE_BATCH_SIZE).get();
        if (likes.empty) break;
        const batch = db.batch();
        likes.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        if (likes.size < WRITE_BATCH_SIZE) break;
      }
    }
    const batch = db.batch();
    page.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deletedComments += page.size;
    if (page.size < WRITE_BATCH_SIZE) break;
  }

  const deleted = {
    watchVideoLikes: await deleteByField(db, "watchVideoLikes", "videoId", videoId),
    watchVideoShares: await deleteByField(db, "watchVideoShares", "videoId", videoId),
    savedWatchVideos: await deleteByField(db, "savedWatchVideos", "videoId", videoId),
    legacyVideoComments: await deleteByField(db, "videoComments", "videoId", videoId),
    legacyVideoCommentReplies: await deleteByField(db, "videoCommentReplies", "videoId", videoId),
  };
  const archived = {
    videoReports: await archiveByField(db, "videoReports", "videoId", videoId),
    videoCommentReportsByContentId: await archiveByField(db, "videoCommentReports", "contentId", videoId),
    legacyVideoCommentReports: await archiveByField(db, "videoCommentReports", "videoId", videoId),
  };
  await videoRef.delete();
  return { deletedComments, deleted, archived };
}
