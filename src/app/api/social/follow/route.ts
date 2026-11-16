import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

async function authenticate(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token || token.length > 8192) return null;
  try {
    return (await getAdminAuth().verifyIdToken(token, true)).uid;
  } catch {
    return null;
  }
}

function targetFrom(value: unknown) {
  const targetUid = typeof value === "string" ? value.trim() : "";
  return targetUid && targetUid.length <= 128 && !/[\\/]/.test(targetUid)
    ? targetUid
    : "";
}

export async function GET(req: Request) {
  const uid = await authenticate(req);
  if (!uid) return fail("Unauthorized", 401);
  const targetUid = targetFrom(new URL(req.url).searchParams.get("targetUid"));
  if (!targetUid || targetUid === uid) return fail("Invalid target user", 400);
  try {
    const edge = await getAdminDb().collection("users").doc(uid).collection("following").doc(targetUid).get();
    return NextResponse.json({ success: true, following: edge.exists });
  } catch (error) {
    console.error("Follow status lookup failed:", error);
    return fail("Unable to check follow status", 500);
  }
}

async function changeFollow(req: Request, action: "follow" | "unfollow") {
  const uid = await authenticate(req);
  if (!uid) return fail("Unauthorized", 401);

  let body: { targetUid?: unknown };
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 4096) return fail("Request body too large", 413);
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Invalid JSON body", 400);
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const targetUid = targetFrom(body.targetUid);
  if (!targetUid || targetUid === uid) return fail("Invalid target user", 400);

  try {
    const db = getAdminDb();
    const followerRef = db.collection("users").doc(uid);
    const targetRef = db.collection("users").doc(targetUid);
    const followerEdge = targetRef.collection("followers").doc(uid);
    const followingEdge = followerRef.collection("following").doc(targetUid);
    const notificationHash = createHash("sha256").update(targetUid).update("\0").update(uid).digest("hex");
    const notificationRef = db.collection("notifications").doc(`follow_${notificationHash}`);
    const sender = action === "follow" ? await getAdminAuth().getUser(uid) : null;

    const result = await db.runTransaction(async (tx) => {
      const [followerSnap, targetSnap, followerEdgeSnap, followingEdgeSnap, notificationSnap] = await Promise.all([
        tx.get(followerRef),
        tx.get(targetRef),
        tx.get(followerEdge),
        tx.get(followingEdge),
        action === "follow" ? tx.get(notificationRef) : Promise.resolve(null),
      ]);
      if (!followerSnap.exists) return "follower-missing" as const;
      if (!targetSnap.exists) return "target-missing" as const;

      const hasFollowerEdge = followerEdgeSnap.exists;
      const hasFollowingEdge = followingEdgeSnap.exists;

      if (action === "follow") {
        if (hasFollowerEdge && hasFollowingEdge) return "already-following" as const;
        if (!hasFollowerEdge) tx.create(followerEdge, { uid, timestamp: FieldValue.serverTimestamp() });
        if (!hasFollowingEdge) tx.create(followingEdge, { uid: targetUid, timestamp: FieldValue.serverTimestamp() });

        if (!hasFollowerEdge && !hasFollowingEdge) {
          const followerCount = Number(followerSnap.data()?.followingCount ?? 0);
          const targetCount = Number(targetSnap.data()?.followersCount ?? 0);
          tx.update(followerRef, {
            followingCount: (Number.isFinite(followerCount) ? Math.max(0, Math.floor(followerCount)) : 0) + 1,
          });
          tx.update(targetRef, {
            followersCount: (Number.isFinite(targetCount) ? Math.max(0, Math.floor(targetCount)) : 0) + 1,
          });
        }

        // A deterministic notification record is created once, atomically with a new relationship.
        if (!notificationSnap?.exists) {
          tx.create(notificationRef, {
            recipientUid: targetUid,
            senderUid: uid,
            senderName: sender?.displayName || "Creator",
            type: "follow",
            message: `${sender?.displayName || "Someone"} started following you.`,
            read: false,
            timestamp: FieldValue.serverTimestamp(),
          });
        }
        return "followed" as const;
      }

      if (!hasFollowerEdge && !hasFollowingEdge) return "not-following" as const;
      if (hasFollowerEdge) tx.delete(followerEdge);
      if (hasFollowingEdge) tx.delete(followingEdge);

      const followerCount = Number(followerSnap.data()?.followingCount ?? 0);
      const targetCount = Number(targetSnap.data()?.followersCount ?? 0);
      tx.update(followerRef, {
        followingCount: Math.max(0, (Number.isFinite(followerCount) ? Math.floor(followerCount) : 0) - 1),
      });
      tx.update(targetRef, {
        followersCount: Math.max(0, (Number.isFinite(targetCount) ? Math.floor(targetCount) : 0) - 1),
      });
      return "unfollowed" as const;
    });

    if (result === "follower-missing") return fail("Your user profile was not found", 404);
    if (result === "target-missing") return fail("Creator not found", 404);
    return NextResponse.json({
      success: true,
      following: action === "follow" ? result !== "not-following" : false,
      alreadyFollowing: result === "already-following",
      changed: result === "followed" || result === "unfollowed",
    });
  } catch (error) {
    console.error("Follow relationship update failed:", error);
    return fail("Unable to update follow status", 500);
  }
}

export async function POST(req: Request) {
  return changeFollow(req, "follow");
}

export async function DELETE(req: Request) {
  return changeFollow(req, "unfollow");
}
