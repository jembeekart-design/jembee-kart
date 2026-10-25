import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHARE_GOAL = 2000;
const WATCH_GOAL_SECONDS = 60000;
const REWARD_AMOUNT = 200;
const REVIEW_DAYS = 15;

async function getUid(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  try {
    return (await getAdminAuth().verifyIdToken(header.slice(7).trim())).uid;
  } catch {
    return null;
  }
}

function safeId(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 && value.length <= 180 && /^[a-zA-Z0-9_-]+$/.test(value) ? value : null;
}

export async function GET(req: Request) {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = getAdminDb();
    const [eventsSnap, watchSnap, rewardSnap] = await Promise.all([
      db.collection("shareCenterEvents").where("ownerId", "==", uid).get(),
      db.collection("shareCenterWatchers").where("ownerId", "==", uid).get(),
      db.collection("shareCenterRewards").doc(uid).get(),
    ]);
    const eventDocs = eventsSnap.docs.sort((a, b) => (b.get("createdAt")?.toMillis?.() || 0) - (a.get("createdAt")?.toMillis?.() || 0)).slice(0, 100);
    const shareCount = eventsSnap.docs.filter(d => d.get("type") === "share").length;
    const followCount = eventsSnap.docs.filter(d => d.get("type") === "follow").length;
    const totalWatchSeconds = watchSnap.docs.reduce((sum, d) => sum + Math.max(0, Number(d.get("seconds") || 0)), 0);
    const shares = shareCount;
    const milestoneReached = shares >= SHARE_GOAL && totalWatchSeconds >= WATCH_GOAL_SECONDS;
    let reward = rewardSnap.exists ? rewardSnap.data() : null;
    if (milestoneReached && !reward) {
      const eligibleAt = new Date(Date.now() + REVIEW_DAYS * 24 * 60 * 60 * 1000);
      const initialReward = { ownerId: uid, amount: REWARD_AMOUNT, status: "under_review", milestoneReachedAt: FieldValue.serverTimestamp(), eligibleAt: Timestamp.fromDate(eligibleAt), createdAt: FieldValue.serverTimestamp() };
      await db.collection("shareCenterRewards").doc(uid).create(initialReward);
      reward = initialReward;
    }
    const eligibleAt = reward?.eligibleAt?.toDate?.() ?? (reward?.eligibleAt instanceof Date ? reward.eligibleAt : null);
    const rewardStatus = !milestoneReached ? "in_progress" : eligibleAt && eligibleAt.getTime() <= Date.now() ? "eligible_for_review" : "under_review";
    return NextResponse.json({
      summary: { shares, totalWatchSeconds, followersGained: followCount, shareGoal: SHARE_GOAL, watchGoalSeconds: WATCH_GOAL_SECONDS, rewardAmount: REWARD_AMOUNT, rewardStatus, eligibleAt: eligibleAt?.toISOString() ?? null },
      history: eventDocs.map((d) => { const x = d.data(); return { id: d.id, type: x.type, videoId: x.videoId ?? null, platform: x.platform ?? null, viewerId: x.viewerId ?? null, followerId: x.followerId ?? null, seconds: x.seconds ?? null, createdAt: x.createdAt?.toDate?.()?.toISOString?.() ?? null }; }),
      watchHistory: watchSnap.docs.map((d) => { const x = d.data(); return { id: d.id, videoId: x.videoId, viewerId: x.viewerId ?? null, seconds: Number(x.seconds || 0), startedAt: x.startedAt?.toDate?.()?.toISOString?.() ?? null, updatedAt: x.updatedAt?.toDate?.()?.toISOString?.() ?? null }; }),
    });
  } catch (error) {
    console.error("share-center GET failed", error);
    return NextResponse.json({ error: "Unable to load share history" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const type = body?.type;
  const videoId = safeId(body?.videoId);
  if (!videoId || !["share", "watch", "follow"].includes(type)) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  const db = getAdminDb();
  try {
    if (type === "share") {
      const platform = ["whatsapp", "facebook", "telegram", "copy", "native", "other"].includes(body.platform) ? body.platform : "other";
      const eventId = safeId(body.eventId) || crypto.randomUUID();
      const ref = db.collection("shareCenterEvents").doc(`${uid}_${eventId}`);
      await db.runTransaction(async (tx) => {
        const old = await tx.get(ref);
        if (old.exists) return;
        tx.set(ref, { ownerId: uid, type: "share", videoId, platform, createdAt: FieldValue.serverTimestamp() });
      });
      return NextResponse.json({ success: true });
    }
    if (type === "watch") {
      const seconds = Math.min(15, Math.max(0, Math.floor(Number(body.seconds) || 0)));
      const sessionId = safeId(body.sessionId);
      if (!sessionId || seconds < 1) return NextResponse.json({ error: "Invalid watch event" }, { status: 400 });
      const shareOwnerId = safeId(body.shareOwnerId) || uid;
      const ref = db.collection("shareCenterWatchers").doc(`${shareOwnerId}_${uid}_${videoId}`);
      let accepted = false;
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) {
          tx.set(ref, { ownerId: shareOwnerId, viewerId: uid, videoId, sessionId, seconds, startedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
          accepted = true;
          return;
        }
        if (snap.get("sessionId") !== sessionId) return; // A second playback of the same video does not count again.
        const old = Math.max(0, Number(snap.get("seconds") || 0));
        tx.update(ref, { seconds: Math.min(old + seconds, 86400), updatedAt: FieldValue.serverTimestamp() });
        accepted = true;
      });
      return NextResponse.json({ success: true, accepted });
    }
    // Follow attribution is only accepted for a distinct authenticated follower and explicit share attribution.
    const followerId = safeId(body.followerId);
    const shareOwnerId = safeId(body.shareOwnerId);
    if (!followerId || !shareOwnerId || followerId !== uid || shareOwnerId === uid) return NextResponse.json({ error: "Invalid follow attribution" }, { status: 400 });
    const eventId = `${shareOwnerId}_${followerId}_${videoId}`;
    const ref = db.collection("shareCenterEvents").doc(`follow_${eventId}`);
    await db.runTransaction(async (tx) => {
      const old = await tx.get(ref);
      if (!old.exists) tx.set(ref, { ownerId: shareOwnerId, type: "follow", videoId, followerId, createdAt: FieldValue.serverTimestamp() });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("share-center POST failed", error);
    return NextResponse.json({ error: "Unable to record event" }, { status: 500 });
  }
}
