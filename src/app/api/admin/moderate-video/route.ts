import { NextResponse } from "next/server";
import { classifyGoogleDriveError, googleDriveClientMessage, googleDriveErrorHttpStatus } from "@/lib/googleDriveErrors";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { deleteDriveFile } from "@/services/googleDriveService";
import { createVideoModerationAuditRecord, parseVideoModerationDecision } from "@/modules/moderation/decision";
import {
  createModerationAuditDocumentId,
  isMatchingModerationAuditRecord,
  isModerationLeaseExpired,
  toModerationTimestampMillis,
} from "@/modules/moderation/recovery.mjs";

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

export async function POST(req: Request) {
  let submissionId = "";

  try {
    const adminId = await verifyAdmin(req);

    const body = await req.json();

    submissionId =
      typeof body?.submissionId === "string"
        ? body.submissionId.trim()
        : "";

    const decision = parseVideoModerationDecision(body);
    const action = decision?.action ?? "";

    if (!submissionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission ID is required",
        },
        { status: 400 }
      );
    }

    if (!decision) {
      return NextResponse.json(
        { success: false, message: "Invalid moderation decision. Rejection requires a reason of at most 500 characters." },
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

    const rejectionRetryable =
    action === "reject" &&
    ["reject_failed", "reject_audit_failed", "rejecting"].includes(submission.status);

  if (submission.status !== "pending" && !rejectionRetryable) {
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
      const claimed = await adminDb.runTransaction(async (transaction) => {
        const current = await transaction.get(submissionRef);
        if (!current.exists) return false;

        const data = current.data() || {};
        const currentStatus = data.status;
        const retryable =
          currentStatus === "pending" ||
          currentStatus === "reject_failed" ||
          currentStatus === "reject_audit_failed";

        const startedAt = toModerationTimestampMillis(data.rejectionStartedAt);
        const expiredRejecting =
          currentStatus === "rejecting" &&
          startedAt !== null &&
          isModerationLeaseExpired(startedAt, Date.now(), 5 * 60 * 1000);

        if (!retryable && !expiredRejecting) return false;

        transaction.update(submissionRef, {
          status: "rejecting",
          processingBy: adminId,
          rejectionStartedAt: FieldValue.serverTimestamp(),
        });
        return true;
      });

      if (!claimed) {
        return NextResponse.json(
          { success: false, message: "Submission is already being processed or is no longer rejectable" },
          { status: 409 }
        );
      }

      const auditRef = adminDb
        .collection("videoModerationAuditLogs")
        .doc(createModerationAuditDocumentId(submissionId, "reject"));

      try {
        const currentSubmission = await submissionRef.get();
        const alreadyDeleted = currentSubmission.data()?.rejectionDriveFileDeleted === true;

        if (!alreadyDeleted) {
          await deleteDriveFile(driveFileId);
          await submissionRef.update({
            status: "reject_audit_failed",
            rejectionDriveFileDeleted: true,
            rejectionDriveDeletedAt: FieldValue.serverTimestamp(),
          });
        }

        await adminDb.runTransaction(async (transaction) => {
          const current = await transaction.get(submissionRef);
          const existingAudit = await transaction.get(auditRef);

          if (!current.exists) {
            throw new Error("Moderation submission disappeared during rejection");
          }

          const currentData = current.data() || {};
          if (!["rejecting", "reject_audit_failed"].includes(currentData.status)) {
            throw new Error("Rejection state changed unexpectedly");
          }

          if (existingAudit.exists) {
            if (!isMatchingModerationAuditRecord(existingAudit.data(), submissionId, "reject")) {
              throw new Error("Existing moderation audit record does not match this rejection");
            }
          } else {
            transaction.create(auditRef, {
              ...createVideoModerationAuditRecord({
                submissionId,
                adminId,
                action: "reject",
                reason: decision.reason,
              }),
              createdAt: FieldValue.serverTimestamp(),
            });
          }

          transaction.update(submissionRef, {
            status: "rejected",
            moderation: "rejected",
            moderatedBy: adminId,
            moderationReason: decision.reason,
            moderationCheckedAt: FieldValue.serverTimestamp(),
            rejectedAt: FieldValue.serverTimestamp(),
            processingBy: FieldValue.delete(),
            rejectionStartedAt: FieldValue.delete(),
          });
        });
      } catch (rejectionError) {
        await submissionRef.update({
          status: "reject_audit_failed",
          rejectionRecoveryErrorAt: FieldValue.serverTimestamp(),
        }).catch(() => undefined);
        throw rejectionError;
      }

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

    const videoRef = adminDb
      .collection("watchEarnVideos")
      .doc(submissionId);
    const auditRef = adminDb
      .collection("videoModerationAuditLogs")
      .doc(createModerationAuditDocumentId(submissionId, "approve"));

    let createdVideoDocument = false;
    let existingVideoConflict = false;

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

      // Video moderation never credits viewer wallet coins.
      const rewardCoins = 0;

      const existingVideo =
        await videoRef.get();

      if (existingVideo.exists) {
        existingVideoConflict = true;
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
        videoFormat: submission.videoFormat === "long" ? "long" : "short",
        durationSeconds: typeof submission.durationSeconds === "number" && Number.isFinite(submission.durationSeconds) && submission.durationSeconds > 0 ? submission.durationSeconds : null,
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
            ? "pending_admin_activation"
            : "free",
        paidCheckoutEnabled: false,
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

        // Paid videos remain hidden until an admin explicitly enables checkout.
        active: submission.videoAccess !== "paid",
        featured: false,

        status: "approved",
        moderation: "safe",

        createdAt: Date.now(),
        moderationCheckedAt:
          FieldValue.serverTimestamp(),
      });
      createdVideoDocument = true;

      const approveBatch = adminDb.batch();
      approveBatch.update(submissionRef, {
        status: "approved",
        moderation: "safe",
        moderatedBy: adminId,
        moderationReason: null,
        moderationCheckedAt: FieldValue.serverTimestamp(),
        approvedAt: FieldValue.serverTimestamp(),
        watchEarnVideoId: submissionId,
      });
      approveBatch.create(auditRef, {
        ...createVideoModerationAuditRecord({ submissionId, adminId, action: "approve" }),
        createdAt: FieldValue.serverTimestamp(),
      });
      await approveBatch.commit();

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
      let auditSnapshot = null;

      try {
        auditSnapshot = await auditRef.get();
      } catch (auditReadError) {
        console.error(
          "Could not verify approval audit after processing error:",
          auditReadError
        );
      }

      if (auditSnapshot?.exists) {
        if (
          !isMatchingModerationAuditRecord(
            auditSnapshot.data(),
            submissionId,
            "approve"
          )
        ) {
          await submissionRef.update({
            status: "approval_recovery_failed",
            approvalRecoveryErrorAt: FieldValue.serverTimestamp(),
          }).catch(() => undefined);

          throw new Error("Existing approval audit record does not match this submission");
        }

        await adminDb.runTransaction(async (transaction) => {
          const current = await transaction.get(submissionRef);
          const confirmedAudit = await transaction.get(auditRef);

          if (
            !current.exists ||
            !confirmedAudit.exists ||
            !isMatchingModerationAuditRecord(
              confirmedAudit.data(),
              submissionId,
              "approve"
            )
          ) {
            throw new Error("Approval audit could not be confirmed during recovery");
          }

          transaction.update(submissionRef, {
            status: "approved",
            moderation: "safe",
            watchEarnVideoId: submissionId,
            processingBy: FieldValue.delete(),
            processingStartedAt: FieldValue.delete(),
            approvedAt: FieldValue.serverTimestamp(),
          });
        });

        return NextResponse.json({
          success: true,
          action: "approved",
          submissionId,
          videoId: submissionId,
          recovered: true,
        });
      }

      let rollbackSucceeded = false;

      // Never delete a video when the audit read failed:
      // the approval batch may already have committed.
      if (
        auditSnapshot !== null &&
        !auditSnapshot.exists &&
        !existingVideoConflict
      ) {
        try {
          const persistedVideo = await videoRef.get();

          if (persistedVideo.exists) {
            await videoRef.delete();
          }

          rollbackSucceeded = true;
        } catch (rollbackError) {
          console.error(
            "Failed to verify or roll back approval video document:",
            rollbackError
          );
        }
      }

      const canReturnToPending =
        auditSnapshot !== null &&
        !auditSnapshot.exists &&
        rollbackSucceeded &&
        !existingVideoConflict;

      try {
        await submissionRef.update({
          status: canReturnToPending
            ? "pending"
            : "approval_recovery_failed",
          processingBy: FieldValue.delete(),
          processingStartedAt: FieldValue.delete(),
          lastProcessingError:
            processingError instanceof Error
              ? processingError.message
              : "Approval processing failed",
          approvalRecoveryErrorAt: canReturnToPending
            ? FieldValue.delete()
            : FieldValue.serverTimestamp(),
        });
      } catch (stateError) {
        console.error(
          "Failed to update moderation recovery state:",
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

    const code = classifyGoogleDriveError(error);
    console.error("Admin video moderation request failed:", code);
    return NextResponse.json(
      { success: false, code, message: googleDriveClientMessage(code) },
      { status: googleDriveErrorHttpStatus(code) }
    );
  }
}
