import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { deleteDriveFile } from "@/services/googleDriveService";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let creatorId: string;

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    creatorId = decodedToken.uid;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("submissionId" in body) ||
    typeof (body as { submissionId: unknown }).submissionId !== "string"
  ) {
    return NextResponse.json(
      { success: false, message: "submissionId is required" },
      { status: 400 }
    );
  }

  const submissionId =
    (body as { submissionId: string }).submissionId.trim();

  if (!submissionId) {
    return NextResponse.json(
      { success: false, message: "submissionId is required" },
      { status: 400 }
    );
  }

  const adminDb = getAdminDb();
  const docRef = adminDb
    .collection("videoModerationSubmissions")
    .doc(submissionId);

  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    return NextResponse.json({
      success: true,
      message: "Moderation submission already removed",
    });
  }

  const data = snapshot.data();

  if (!data || data.creatorId !== creatorId) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  const driveFileId =
    typeof data.driveFileId === "string"
      ? data.driveFileId.trim()
      : "";

  if (driveFileId) {
    try {
      await deleteDriveFile(driveFileId);
    } catch (error) {
      console.error(
        "Drive cleanup failed during moderation cancellation:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: "Failed to remove moderation video from Drive",
        },
        { status: 500 }
      );
    }
  }

  await docRef.delete();

  return NextResponse.json({
    success: true,
  });
}
