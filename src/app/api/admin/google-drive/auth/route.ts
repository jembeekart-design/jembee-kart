import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { createGoogleAuthorizationUrl } from "@/lib/googleDriveOAuth";

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

  const decodedToken = await getAdminAuth().verifyIdToken(token);

  const snapshot = await getAdminDb()
    .collection("users")
    .where("uid", "==", decodedToken.uid)
    .limit(1)
    .get();

  const userDoc = snapshot.docs[0];

  if (
    !userDoc ||
    (userDoc.data()?.role !== "admin" &&
      userDoc.data()?.role !== "super_admin")
  ) {
    throw new Error("FORBIDDEN");
  }

  return decodedToken.uid;
}

export async function POST(req: Request) {
  try {
    const uid = await verifyAdmin(req);

    const authorizationUrl = createGoogleAuthorizationUrl(uid);

    return NextResponse.json({
      success: true,
      authorizationUrl,
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

    console.error("Google Drive OAuth start error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to start Google Drive authorization",
      },
      { status: 500 }
    );
  }
}
