import { FieldValue, type Firestore, type DocumentReference } from "firebase-admin/firestore";

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


async function archiveVideoNotifications(db: Firestore, videoId: string) {
  const notifications = db.collection("shorts_notifications");
  let archived = 0;

  while (true) {
    const first = await notifications.where("videoId", "==", videoId).limit(1).get();
    if (first.empty) break;

    const firstDoc = first.docs[0];
    const userId = typeof firstDoc.data().userId === "string" ? firstDoc.data().userId.trim() : "";

    // Process malformed records individually so they cannot skip a valid user unread counter.
    if (!userId) {
      await firstDoc.ref.update({
        videoDeleted: true, isRead: true,
        deepLink: FieldValue.delete(), videoId: FieldValue.delete(),
        commentId: FieldValue.delete(), archivedAt: new Date(),
      });
      archived += 1;
      continue;
    }

    const userQuery = notifications.where("videoId", "==", videoId).where("userId", "==", userId).limit(400);
    const count = await db.runTransaction(async (transaction) => {
      const page = await transaction.get(userQuery);
      if (page.empty) return 0;
      const metaRef = db.collection("shorts_notification_meta").doc(userId);
      const meta = await transaction.get(metaRef);
      const unreadRemoved = page.docs.filter((doc) => doc.data().isRead !== true).length;
      page.docs.forEach((doc) => transaction.update(doc.ref, {
        videoDeleted: true, isRead: true,
        deepLink: FieldValue.delete(), videoId: FieldValue.delete(),
        commentId: FieldValue.delete(), archivedAt: new Date(),
      }));
      const currentUnread = Number(meta.data()?.unreadCount ?? 0);
      transaction.set(metaRef, {
        unreadCount: Math.max(0, (Number.isFinite(currentUnread) ? currentUnread : 0) - unreadRemoved),
        updatedAt: new Date(),
      }, { merge: true });
      return page.size;
    });
    archived += count;
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

  const archivedNotifications = await archiveVideoNotifications(db, videoId);

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
  return { deletedComments, deleted, archived, archivedNotifications };
}
