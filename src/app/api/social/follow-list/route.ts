import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(req: Request) {
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

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  if (type !== "followers" && type !== "following") return fail("Invalid list type", 400);
  const requestedLimit = Number(url.searchParams.get("limit") || 50);
  const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(100, Math.floor(requestedLimit))) : 50;

  try {
    const db = getAdminDb();
    const edgeSnapshot = await db.collection("users").doc(uid).collection(type).limit(limit + 1).get();
    const hasMore = edgeSnapshot.docs.length > limit;
    const edges = edgeSnapshot.docs.slice(0, limit);
    const users = await Promise.all(edges.map(async (edge) => {
      const userSnap = await db.collection("users").doc(edge.id).get();
      if (!userSnap.exists) return null;
      const data = userSnap.data() || {};
      return {
        id: userSnap.id,
        name: typeof data.name === "string" ? data.name : typeof data.displayName === "string" ? data.displayName : "User",
        username: typeof data.username === "string" ? data.username : `user_${userSnap.id.slice(0, 4)}`,
        photoUrl: typeof data.photoUrl === "string" ? data.photoUrl : typeof data.photoURL === "string" ? data.photoURL : "/default-avatar.png",
        followedAt: edge.get("timestamp")?.toDate?.().toISOString?.() ?? null,
      };
    }));
    return NextResponse.json({
      success: true,
      type,
      users: users.filter((user): user is NonNullable<typeof user> => user !== null),
      hasMore,
      nextCursor: hasMore ? edges[edges.length - 1]?.id ?? null : null,
    });
  } catch (error) {
    console.error("Follow list retrieval failed:", error);
    return fail("Unable to load follow list", 500);
  }
}
