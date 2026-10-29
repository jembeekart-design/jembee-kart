import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authorization.slice(7).trim();
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    const db = getAdminDb();
    const uid = decoded.uid;

    const [earningsSnap, savedSnap] = await Promise.all([
      db.collection("creatorAdEarnings")
        .where("creatorId", "==", uid)
        .where("status", "==", "AVAILABLE")
        .limit(500)
        .get(),
      db.collection("savedWatchVideos")
        .where("userId", "==", uid)
        .limit(200)
        .get(),
    ]);

    const adEarnings = earningsSnap.docs.reduce(
      (sum, item) => sum + Number(item.data().creatorAmount || 0),
      0
    );

    const savedIds = [
      ...new Set(
        savedSnap.docs
          .map((item) => item.data().videoId)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      ),
    ];

    const savedResults = await Promise.all(
      savedIds.map(async (id) => {
        const snap = await db.collection("watchEarnVideos").doc(id).get();
        if (!snap.exists) return null;

        const data = snap.data();
        if (!data) return null;

        return JSON.parse(JSON.stringify({ id: snap.id, ...data }));
      })
    );

    return NextResponse.json({
      success: true,
      adEarnings,
      savedVideos: savedResults.filter(Boolean),
    });
  } catch (error) {
    const unauthorized =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message.includes("Firebase ID token"));

    console.error("Profile watch data load failed:", error);

    return NextResponse.json(
      { success: false, message: "Profile data could not be loaded" },
      { status: unauthorized ? 401 : 500 }
    );
  }
}
