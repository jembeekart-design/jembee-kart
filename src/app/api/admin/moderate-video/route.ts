import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { deleteDriveFile } from "@/services/googleDriveService";

export const runtime = "nodejs";

async function verifyAdmin(req: Request): Promise<string> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const decodedToken =
    await getAdminAuth().verifyIdToken(token);

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

export async function POST(req: Request) {
  let submissionId = "";

  try {
    const adminId = await verifyAdmin(req);

    const body = await req.json();

    submissionId =
      typeof body?.submissionId === "string"
        ? body.submissionId.trim()
        : "";

    const action =
      typeof body?.action === "string"
        ? body.action.trim().toLowerCase()
        : "";

    if (!submissionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission ID is required",
        },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Action must be approve or reject",
        },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    const submissionRef = adminDb
      .collection("videoModerationSubmissions")
      .doc(submissionId);

    const submissionSnapshot =
      await submissionRef.get();

    if (!submissionSnapshot.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Moderation submission not found",
        },
        { status: 404 }
      );
    }

    const submission =
      submissionSnapshot.data() || {};

    if (submission.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message:
            `Submission is already ${submission.status}`,
        },
        { status: 409 }
      );
    }

    const driveFileId =
      typeof submission.driveFileId === "string"
        ? submission.driveFileId.trim()
        : "";

    if (!driveFileId) {
      return NextResponse.json(
        {
          success: false,
          message: "Drive file ID is missing",
        },
        { status: 500 }
      );
    }

    // ==================================================
    // REJECT
    // ==================================================

    if (action === "reject") {
      await deleteDriveFile(driveFileId);

      await submissionRef.update({
        status: "rejected",
        moderation: "rejected",
        moderatedBy: adminId,
        moderationCheckedAt:
          FieldValue.serverTimestamp(),
        rejectedAt:
          FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        action: "rejected",
        submissionId,
      });
    }

    // ==================================================
    // APPROVE
    // ==================================================

    /*
     * Move pending -> processing before external work.
     * This prevents two admins from approving the same
     * submission simultaneously.
     */
    const claimed =
      await adminDb.runTransaction(async (transaction) => {
        const snapshot =
          await transaction.get(submissionRef);

        if (!snapshot.exists) {
          return false;
        }

        const data = snapshot.data() || {};

        if (data.status !== "pending") {
          return false;
        }

        transaction.update(submissionRef, {
          status: "processing",
          processingBy: adminId,
          processingStartedAt:
            FieldValue.serverTimestamp(),
        });

        return true;
      });

    if (!claimed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Submission is already being processed or is no longer pending",
        },
        { status: 409 }
      );
    }

    let createdVideoDocument = false;

    try {
      const finalVideoUrl =
        `/api/shorts/video-stream/${encodeURIComponent(submissionId)}`;

      const thumbnailUrl =
        `/api/shorts/video-thumbnail/${encodeURIComponent(submissionId)}`;

      // Drive-hosted videos are not Cloudinary-enhanced.
      const finalIsEnhanced = false;

      const musicId =
        typeof submission.music === "string" &&
        submission.music.trim()
          ? submission.music
          : `original-${submissionId}`;

      const rewardCoins =
        submission.sponsor === true
          ? 25
          : 5;

      const videoRef = adminDb
        .collection("watchEarnVideos")
        .doc(submissionId);

      const existingVideo =
        await videoRef.get();

      if (existingVideo.exists) {
        throw new Error(
          "WatchEarn video already exists for this submission"
        );
      }

      await videoRef.set({
        userId: submission.creatorId,
        creatorId: submission.creatorId,

        displayName:
          submission.displayName || "",
        photoURL:
          submission.photoURL || "",
        username:
          submission.username || "",

        caption:
          submission.caption || "",
        videoAccess: submission.videoAccess === "paid" ? "paid" : "free",
        videoPrice:
          submission.videoAccess === "paid" &&
          typeof submission.videoPrice === "number" &&
          Number.isFinite(submission.videoPrice) &&
          submission.videoPrice >= 1 &&
          submission.videoPrice <= 100000
            ? submission.videoPrice
            : 0,
        paidVideoStatus:
          submission.videoAccess === "paid"
            ? "payment_integration_pending"
            : "free",
        hashtags:
          Array.isArray(submission.hashtags)
            ? submission.hashtags
            : [],
        music: musicId,

        originalVideoId:
          submission.originalVideoId || null,
        originalAudioId:
          submission.originalAudioId || null,

        verified: false,
        isEnhanced: finalIsEnhanced,
        sponsor:
          submission.sponsor === true,

        driveFileId,
        video: finalVideoUrl,
        thumbnail: thumbnailUrl,

        coins: rewardCoins,
        pendingCoins: 0,

        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        views: 0,
        watchTime: 0,

        active: true,
        featured: false,

        status: "approved",
        moderation: "safe",

        createdAt: Date.now(),
        moderationCheckedAt:
          FieldValue.serverTimestamp(),
      });
      createdVideoDocument = true;

      await submissionRef.update({
        status: "approved",
        moderation: "safe",
        moderatedBy: adminId,
        moderationCheckedAt:
          FieldValue.serverTimestamp(),
        approvedAt:
          FieldValue.serverTimestamp(),
        watchEarnVideoId: submissionId,
      });

      return NextResponse.json({
        success: true,
        action: "approved",
        submissionId,
        videoId: submissionId,
        videoUrl: finalVideoUrl,
        thumbnail: thumbnailUrl,
        isEnhanced: finalIsEnhanced,
        coins: rewardCoins,
      });
    } catch (processingError) {
      if (createdVideoDocument) {
        try {
          await adminDb
            .collection("watchEarnVideos")
            .doc(submissionId)
            .delete();
        } catch (rollbackError) {
          console.error(
            "Failed to roll back newly created video document:",
            rollbackError
          );
        }
      }

      try {
        await submissionRef.update({
          status: "pending",
          processingBy:
            FieldValue.delete(),
          processingStartedAt:
            FieldValue.delete(),
          lastProcessingError:
            processingError instanceof Error
              ? processingError.message
              : "Approval processing failed",
        });
      } catch (stateError) {
        console.error(
          "Failed to restore moderation submission state:",
          stateError
        );
      }

      throw processingError;
    }
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
      "Admin video moderation API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Video moderation failed",
      },
      { status: 500 }
    );
  }
}
