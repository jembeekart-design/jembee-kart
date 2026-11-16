import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: Request) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return fail("Unauthorized", 401);
  const token = authorization.slice(7).trim();
  if (!token || token.length > 8192) return fail("Unauthorized", 401);

  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(token, true)).uid;
  } catch {
    return fail("Unauthorized", 401);
  }

  let body: { targetUid?: unknown };
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 4096) return fail("Request body too large", 413);
    body = JSON.parse(raw);
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const targetUid = typeof body.targetUid === "string" ? body.targetUid.trim() : "";
  if (!targetUid || targetUid.length > 128 || /[\\/]/.test(targetUid) || targetUid === uid) {
    return fail("Invalid target user", 400);
  }

  try {
    const db = getAdminDb();
    const [follower, target] = await Promise.all([
      getAdminAuth().getUser(uid),
      db.collection("users").doc(targetUid).get(),
    ]);
    if (!target.exists) return fail("Creator not found", 404);

    const followerEdge = db.collection("users").doc(targetUid).collection("followers").doc(uid);
    const followingEdge = db.collection("users").doc(uid).collection("following").doc(targetUid);
    const notificationId = createHash("sha256").update(targetUid).update("\0").update(uid).digest("hex");
    const notificationRef = db.collection("notifications").doc(`follow_${notificationId}`);

    const result = await db.runTransaction(async (tx) => {
      const [followerSnap, followingSnap, notificationSnap] = await Promise.all([
        tx.get(followerEdge),
        tx.get(followingEdge),
        tx.get(notificationRef),
      ]);
      if (!followerSnap.exists || !followingSnap.exists) return "relationship-missing" as const;
      if (notificationSnap.exists) return "already-created" as const;
      tx.create(notificationRef, {
        recipientUid: targetUid,
        senderUid: uid,
        senderName: follower.displayName || "Creator",
        type: "follow",
        message: `${follower.displayName || "Someone"} started following you.`,
        read: false,
        timestamp: FieldValue.serverTimestamp(),
      });
      return "created" as const;
    });

    if (result === "relationship-missing") return fail("Follow relationship not found", 409);
    return NextResponse.json({ success: true, duplicate: result === "already-created" });
  } catch (error) {
    console.error("Follow notification creation failed:", error);
    return fail("Unable to create follow notification", 500);
  }
}
