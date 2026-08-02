import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const validateAndSaveComment = functions.https.onCall(async (data, context) => {
  const { videoId, commentText, userId } = data;

  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  // 1. Fetch live settings from Firestore (Never trust client)
  const settingsSnap = await db.collection('commentModeration').doc('settings').get();
  if (!settingsSnap.exists) {
    throw new functions.https.HttpsError('failed-precondition', 'Moderation settings not initialized.');
  }
  const settings = settingsSnap.data() as any;

  if (!settings.commentsEnabled) {
    throw new functions.https.HttpsError('permission-denied', 'Comments are disabled.');
  }

  // 2. Check User Ban Status
  const violationRef = db.collection('commentViolations').doc(userId);
  const violationSnap = await violationRef.get();
  if (violationSnap.exists) {
    const vData = violationSnap.data() as any;
    if (vData.isPermanent || (vData.banUntil && Date.now() < vData.banUntil)) {
      throw new functions.https.HttpsError('permission-denied', 'User is currently banned from commenting.');
    }
  }

  // 3. Length checks
  if (commentText.length < (settings.minCommentLength || 1) || commentText.length > (settings.maxCommentLength || 500)) {
    throw new functions.https.HttpsError('invalid-argument', 'Comment length violates constraints.');
  }

  // 4. Whitelist override & Blocked words check
  const workingText = settings.caseInsensitive ? commentText.toLowerCase() : commentText;
  const whitelistedWords: string[] = settings.allowedWords || [];
  let cleanText = workingText;
  whitelistedWords.forEach((w: string) => {
    const tw = settings.caseInsensitive ? w.toLowerCase() : w;
    cleanText = cleanText.split(tw).join('WHITELISTED');
  });

  if (settings.enabled && settings.blockedWords) {
    for (const word of settings.blockedWords) {
      const bw = settings.caseInsensitive ? word.toLowerCase() : word;
      const matched = settings.blockPartialMatch ? cleanText.includes(bw) : cleanText.split(/\s+/).includes(bw);
      if (matched) {
        // Record Violation infraction
        await recordViolation(userId);
        throw new functions.https.HttpsError('invalid-argument', settings.customMessage || 'Restricted words detected.');
      }
    }
  }

  // 5. Duplicate Comment Check
  const duplicateWindow = settings.duplicateCommentWindowSeconds || 60;
  const windowTime = new Date(Date.now() - duplicateWindow * 1000);
  const recentDupes = await db.collection('comments')
    .where('userId', '==', userId)
    .where('commentText', '==', commentText)
    .where('createdAt', '>=', windowTime)
    .get();

  if (!recentDupes.empty) {
    throw new functions.https.HttpsError('already-exists', 'Duplicate comment detected within time window.');
  }

  // 6. Save Comment based on Approval Mode
  const status = settings.autoApproveComments ? 'approved' : 'pending';
  
  const commentRef = await db.collection('comments').add({
    videoId,
    userId,
    commentText,
    status,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true, commentId: commentRef.id, status };
});

async function recordViolation(userId: string) {
  const ref = db.collection('commentViolations').doc(userId);
  const snap = await ref.get();
  let totalViolations = 1;
  let banUntil: number | null = null;
  let isPermanent = false;
  let banReason = 'Blocked words or policy infringement';

  if (snap.exists()) {
    const data = snap.data() as any;
    totalViolations = (data.totalViolations || 0) + 1;
  }

  // Automatic escalation tiers
  const now = Date.now();
  if (totalViolations >= 10) {
    isPermanent = true;
    banUntil = null;
    banReason = 'Exceeded 10 comment violations.';
  } else if (totalViolations >= 5) {
    banUntil = now + 60 * 60 * 1000; // 1 hour ban
  } else if (totalViolations >= 3) {
    banUntil = now + 10 * 60 * 1000; // 10 minute ban
  }

  await ref.set({
    userId,
    totalViolations,
    lastViolation: now,
    banUntil,
    banReason,
    isPermanent
  }, { merge: true });
}
