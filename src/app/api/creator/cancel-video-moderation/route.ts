import { NextResponse } from "next/server";
import { classifyGoogleDriveError } from "@/lib/googleDriveErrors";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { deleteDriveFile } from "@/services/googleDriveService";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

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

  if (!token || token.length > 10_000) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let creatorId: string;

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token, true);
    creatorId = decodedToken.uid;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const parsed = await readBoundedJson(req, 4 * 1024);
  if (!parsed.ok) {
    return NextResponse.json({ success: false, message: parsed.message }, { status: parsed.status });
  }
  const body: unknown = parsed.value;

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

  // Only incomplete uploads may be cancelled. In particular, never delete a
  // submission that was already promoted to pending if the client's completion
  // response was lost due to a network error.
  const claimed = await adminDb.runTransaction(async (tx) => {
    const current = await tx.get(docRef);
    if (!current.exists || current.data()?.creatorId !== creatorId || current.data()?.status !== "uploading") return false;
    tx.update(docRef, { status: "cancelling", cancellationStartedAt: new Date() });
    return true;
  });
  if (!claimed) {
    return NextResponse.json({ success: false, message: "This upload is already completing/cancelling or is no longer cancellable." }, { status: 409 });
  }

  const driveFileId =
    typeof data.driveFileId === "string"
      ? data.driveFileId.trim()
      : "";

  if (driveFileId) {
    try {
      await deleteDriveFile(driveFileId);
    } catch (error) {
      console.error("Drive cleanup failed during moderation cancellation:", classifyGoogleDriveError(error));
      await docRef.update({ status: "cancellation_failed", cancellationErrorAt: new Date() }).catch(() => undefined);

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
