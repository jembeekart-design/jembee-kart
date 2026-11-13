import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { createHash } from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { parseCopyrightClaim } from "@/modules/trust-safety/copyrightClaim";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ") || !header.slice(7).trim()) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(header.slice(7).trim(), true)).uid;
  } catch {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  let raw: unknown;
  try {
    const text = await req.text();
    if (new TextEncoder().encode(text).byteLength > 12_000) {
      return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    }
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const claim = parseCopyrightClaim(raw);
  if (!claim) return NextResponse.json({ success: false, message: "Invalid copyright claim details" }, { status: 400 });

  try {
    const db = getAdminDb();
    const videoRef = db.collection("watchEarnVideos").doc(claim.videoId);
    const claimId = createHash("sha256").update(`${uid}:${claim.videoId}:${claim.claimantEmail}`).digest("hex");
    const claimRef = db.collection("copyrightClaims").doc(claimId);
    const outcome = await db.runTransaction(async (tx) => {
      const video = await tx.get(videoRef);
      const existing = await tx.get(claimRef);
      if (!video.exists) return "video_missing" as const;
      if (existing.exists) return "duplicate" as const;
      tx.create(claimRef, {
        ...claim,
        submittedBy: uid,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return "created" as const;
    });
    if (outcome === "video_missing") return NextResponse.json({ success: false, message: "Video not found" }, { status: 404 });
    if (outcome === "duplicate") return NextResponse.json({ success: false, message: "A claim for this video and claimant already exists" }, { status: 409 });
    return NextResponse.json({ success: true, claimId, status: "pending" }, { status: 201 });
  } catch (error) {
    console.error("Copyright claim submission failed", error);
    return NextResponse.json({ success: false, message: "Unable to submit copyright claim" }, { status: 500 });
  }
}
