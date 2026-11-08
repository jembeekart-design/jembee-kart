import { NextResponse } from "next/server";
import { FieldPath } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const decodedToken =
    await getAdminAuth().verifyIdToken(token, true);

  const users = getAdminDb().collection("users");
  const directDoc = await users.doc(decodedToken.uid).get();

  let userData = directDoc.exists ? directDoc.data() : undefined;

  if (
    userData?.role !== "admin" &&
    userData?.role !== "super_admin"
  ) {
    const snapshot = await users
      .where("uid", "==", decodedToken.uid)
      .limit(1)
      .get();

    const fallbackData = snapshot.docs[0]?.data();

    if (
      fallbackData?.role === "admin" ||
      fallbackData?.role === "super_admin"
    ) {
      userData = fallbackData;
    }
  }

  if (
    !userData ||
    (
      userData?.role !== "admin" &&
      userData?.role !== "super_admin"
    )
  ) {
    throw new Error("FORBIDDEN");
  }

  return decodedToken.uid;
}

export async function GET(req: Request) {
  try {
    await verifyAdmin(req);

    const cursor = new URL(req.url).searchParams.get("cursor");
    if (cursor && (cursor.length > 1500 || cursor.includes("/"))) return NextResponse.json({ success: false, message: "Invalid cursor" }, { status: 400 });
    let queueQuery = getAdminDb().collection("videoModerationSubmissions")
      .where("status", "==", "pending")
      .orderBy(FieldPath.documentId()).limit(101);
    if (cursor) queueQuery = queueQuery.startAfter(cursor);
    const snapshot = await queueQuery.get();
    const pageDocs = snapshot.docs.slice(0, 100);

    const submissions = pageDocs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        submissionId: data.submissionId || doc.id,
        driveFileId: data.driveFileId || "",
        creatorId: data.creatorId || "",
        displayName: data.displayName || "",
        photoURL: data.photoURL || "",
        username: data.username || "",
        caption: data.caption || "",
        hashtags: Array.isArray(data.hashtags)
          ? data.hashtags
          : [],
        music: data.music || "",
        sponsor: data.sponsor === true,
        originalVideoId:
          data.originalVideoId || "",
        originalAudioId:
          data.originalAudioId || "",
        isEnhanced:
          data.isEnhanced === true,
        status: data.status || "pending",
        createdAt: data.createdAt || null,
      };
    });

    return NextResponse.json({
      success: true,
      submissions,
      nextCursor: snapshot.docs.length > 100 ? pageDocs[pageDocs.length - 1]?.id ?? null : null,
      hasMore: snapshot.docs.length > 100,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    console.error(
      "Admin moderation submissions API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load moderation submissions",
      },
      { status: 500 }
    );
  }
}
