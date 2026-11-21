import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";


export async function GET(req: Request) {
  try {
    const authorization = req.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7).trim(), true);
    const db = getAdminDb();
    const snapshot = await db.collection("users").doc(decoded.uid).collection("following").get();
    return NextResponse.json({
      success: true,
      following: snapshot.docs.map((item) => item.id),
    });
  } catch (error) {
    console.error("[NativeFollow] Unable to load following list:", error);
    return NextResponse.json({ success: false, message: "Unable to load following list" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7).trim(), true);
    const body = await req.json().catch(() => null) as { creatorId?: unknown; action?: unknown } | null;
    const creatorId = typeof body?.creatorId === "string" ? body.creatorId.trim() : "";
    const action = body?.action;
    if (!creatorId || creatorId.length > 160 || creatorId.includes("/") || !["follow", "unfollow", "status"].includes(String(action))) {
      return NextResponse.json({ success: false, message: "Invalid follow request" }, { status: 400 });
    }
    if (creatorId === decoded.uid) {
      return NextResponse.json({ success: false, message: "You cannot follow yourself" }, { status: 400 });
    }

    const db = getAdminDb();
    const followerRef = db.collection("users").doc(decoded.uid);
    const targetRef = db.collection("users").doc(creatorId);
    const followerEdge = targetRef.collection("followers").doc(decoded.uid);
    const followingEdge = followerRef.collection("following").doc(creatorId);
    const result = await db.runTransaction(async (tx) => {
      const [targetSnap, followerSnap, edgeSnap] = await Promise.all([
        tx.get(targetRef), tx.get(followerRef), tx.get(followerEdge),
      ]);
      if (!targetSnap.exists || !followerSnap.exists) return { success: false, message: "Creator or user profile not found", status: 404, following: false };
      if (action === "status") return { success: true, status: 200, following: edgeSnap.exists };
      if (action === "follow") {
        if (!edgeSnap.exists) {
          tx.create(followerEdge, { uid: decoded.uid, timestamp: FieldValue.serverTimestamp() });
          tx.set(followingEdge, { uid: creatorId, timestamp: FieldValue.serverTimestamp() });
          tx.update(followerRef, { followingCount: FieldValue.increment(1) });
        }
        return { success: true, status: 200, following: true };
      }
      if (edgeSnap.exists) {
        tx.delete(followerEdge);
        tx.delete(followingEdge);
        const count = Number(followerSnap.data()?.followingCount ?? 0);
        tx.update(followerRef, { followingCount: Math.max(0, count - 1) });
      }
      return { success: true, status: 200, following: false };
    });
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[NativeFollow] Request failed:", error);
    return NextResponse.json({ success: false, message: "Unable to update follow status" }, { status: 500 });
  }
}
