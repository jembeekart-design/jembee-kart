import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import {
  deleteDriveFile,
  downloadDriveFile,
} from "@/services/googleDriveService";
import {
  deleteCloudinaryVideo,
  uploadVideoStreamToCloudinary,
} from "@/services/cloudinaryServerService";

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

  const snapshot = await getAdminDb()
    .collection("users")
    .where("uid", "==", decodedToken.uid)
    .limit(1)
    .get();

  const userDoc = snapshot.docs[0];

  if (
    !userDoc ||
    (
      userDoc.data()?.role !== "admin" &&
      userDoc.data()?.role !== "super_admin"
    )
  ) {
    throw new Error("FORBIDDEN");
  }

  return decodedToken.uid;
}

export async function POST(req: Request) {
  let submissionId = "";
  let uploadedCloudinaryPublicId = "";

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

    let cloudinaryResult:
      | Awaited<
          ReturnType<
            typeof uploadVideoStreamToCloudinary
          >
        >
      | null = null;

    try {
      const driveVideo =
        await downloadDriveFile(driveFileId);

      const uploadPreset =
        submission.isEnhanced === true
          ? "jembeekart_enhanced"
          : "jembeekart";

      cloudinaryResult =
        await uploadVideoStreamToCloudinary(
          driveVideo.stream,
          {
            folder:
              "jembeekart/watch-earn",
            publicId:
              `moderation_${submissionId}`,
            uploadPreset,
          }
        );

      uploadedCloudinaryPublicId =
        cloudinaryResult.publicId;

      const finalVideoUrl =
        submission.isEnhanced === true &&
        cloudinaryResult.eagerSecureUrl
          ? cloudinaryResult.eagerSecureUrl
          : cloudinaryResult.secureUrl;

      const finalIsEnhanced =
        submission.isEnhanced === true &&
        Boolean(
          cloudinaryResult.eagerSecureUrl
        );

      const thumbnailUrl =
        finalVideoUrl
          .replace(
            "/video/upload/",
            "/video/upload/so_1/"
          )
          .replace(
            /\.mp4($|\?)/i,
            ".jpg$1"
          );

      const musicId =
        typeof submission.music === "string" &&
        submission.music.trim()
          ? submission.music
          : `original-${cloudinaryResult.publicId}`;

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

        publicId:
          cloudinaryResult.publicId,
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

      await submissionRef.update({
        status: "approved",
        moderation: "safe",
        moderatedBy: adminId,
        moderationCheckedAt:
          FieldValue.serverTimestamp(),
        approvedAt:
          FieldValue.serverTimestamp(),
        watchEarnVideoId: submissionId,
        cloudinaryPublicId:
          cloudinaryResult.publicId,
        cloudinaryUrl: finalVideoUrl,
      });

      try {
        await deleteDriveFile(driveFileId);
      } catch (driveCleanupError) {
        console.error(
          "Drive cleanup failed after approval:",
          driveCleanupError
        );
      }

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
      if (uploadedCloudinaryPublicId) {
        try {
          await deleteCloudinaryVideo(
            uploadedCloudinaryPublicId
          );
        } catch (cleanupError) {
          console.error(
            "Cloudinary cleanup failed:",
            cleanupError
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
