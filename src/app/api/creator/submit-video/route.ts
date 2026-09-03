import { NextResponse } from "next/server";
import Busboy from "busboy";
import { Readable } from "node:stream";
import crypto from "node:crypto";

import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import {
  deleteDriveFile,
  uploadVideoToDrive,
} from "@/services/googleDriveService";

export const runtime = "nodejs";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

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

  if (!req.body) {
    return NextResponse.json(
      { success: false, message: "Request body is required" },
      { status: 400 }
    );
  }

  const contentType = req.headers.get("content-type") || "";

  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return NextResponse.json(
      {
        success: false,
        message: "multipart/form-data is required",
      },
      { status: 400 }
    );
  }

  const submissionId = crypto.randomUUID();

  let uploadedDriveFileId: string | null = null;
  let requestAborted = false;
  const fields: Record<string, string> = {};

  try {
    const result = await new Promise<{ driveFileId: string }>(
      (resolve, reject) => {
        const busboy = Busboy({
          headers: {
            "content-type": contentType,
          },
          limits: {
            files: 1,
            fileSize: MAX_VIDEO_SIZE,
          },
        });

        let fileFound = false;
        let parserFinished = false;
        let settled = false;
        let sizeExceeded = false;
        let uploadPromise: Promise<string> | null = null;
        let fileStream: Readable | null = null;

        const fields: Record<string, string> = {};

        busboy.on("field", (fieldname, value) => {
          if (fieldname !== "file") {
            fields[fieldname] = value;
          }
        });

        const settleFailure = async (error: unknown) => {
          if (settled) {
            return;
          }

          /*
           * Do not reject while Drive upload is still running.
           * The upload must settle first so a successfully-created
           * Drive file ID can be captured and cleaned up by the
           * outer handler.
           */
          if (uploadPromise) {
            try {
              await uploadPromise;
            } catch {
              // Preserve the original error.
            }
          }

          settled = true;
          reject(error);
        };

        const settleSuccess = (driveFileId: string) => {
          if (settled) {
            return;
          }

          if (requestAborted || sizeExceeded) {
            return;
          }

          settled = true;
          resolve({ driveFileId });
        };

        busboy.on(
          "file",
          (
            fieldname,
            file,
            info
          ) => {
            if (fieldname !== "file") {
              file.resume();
              return;
            }

            if (fileFound) {
              file.resume();
              void settleFailure(
                new Error("Only one video file is allowed")
              );
              return;
            }

            fileFound = true;
            fileStream = file;

            if (
              !info.mimeType ||
              !info.mimeType.toLowerCase().startsWith("video/")
            ) {
              file.resume();
              void settleFailure(
                new Error("Only video files are allowed")
              );
              return;
            }

            file.on("limit", () => {
              sizeExceeded = true;

              file.destroy(
                new Error("Video exceeds the 100MB limit")
              );
            });

            uploadPromise = uploadVideoToDrive(
              `moderation_${submissionId}`,
              file,
              info.mimeType
            ).then((fileId) => {
              uploadedDriveFileId = fileId;
              return fileId;
            });

            void uploadPromise.catch((error) => {
              if (!settled) {
                void settleFailure(error);
              }
            });
          }
        );

        busboy.on("filesLimit", () => {
          void settleFailure(
            new Error("Only one video file is allowed")
          );
        });

        busboy.on("error", (error) => {
          void settleFailure(error);
        });

        busboy.on("finish", async () => {
          parserFinished = true;

          if (!fileFound) {
            await settleFailure(
              new Error("Video file is required")
            );
            return;
          }

          if (!uploadPromise) {
            await settleFailure(
              new Error("Video upload was not started")
            );
            return;
          }

          try {
            const driveFileId = await uploadPromise;

            if (sizeExceeded) {
              await settleFailure(
                new Error("Video exceeds the 100MB limit")
              );
              return;
            }

            if (requestAborted) {
              await settleFailure(
                new Error("Request was aborted")
              );
              return;
            }

            settleSuccess(driveFileId);
          } catch (error) {
            await settleFailure(error);
          }
        });

        req.signal.addEventListener(
          "abort",
          () => {
            requestAborted = true;

            if (fileStream) {
              fileStream.destroy(
                new Error("Request was aborted")
              );
            }

            /*
             * Do not reject immediately. If Drive has already
             * created the file, the upload promise must settle
             * first so the outer cleanup can delete it.
             */
            if (!parserFinished) {
              void settleFailure(
                new Error("Request was aborted")
              );
            }
          },
          { once: true }
        );

        try {
          const webStream = req.body;

          if (!webStream) {
            throw new Error("Request body is required");
          }

          Readable.from(
            webStream as unknown as AsyncIterable<Uint8Array>
          ).pipe(busboy);
        } catch (error) {
          void settleFailure(error);
        }
      }
    );

    uploadedDriveFileId = result.driveFileId;

    const adminDb = getAdminDb();

    try {
      let hashtags: string[] = [];

      if (fields.hashtags) {
        try {
          const parsedHashtags: unknown =
            JSON.parse(fields.hashtags);

          if (Array.isArray(parsedHashtags)) {
            hashtags = parsedHashtags.filter(
              (item): item is string =>
                typeof item === "string"
            );
          }
        } catch {
          hashtags = [];
        }
      }

      const sponsor = fields.sponsor === "true";
      const isEnhanced = fields.isEnhanced === "true";

      await adminDb
        .collection("videoModerationSubmissions")
        .doc(submissionId)
        .set({
          submissionId,
          driveFileId: result.driveFileId,
          creatorId,

          displayName: fields.displayName || "",
          photoURL: fields.photoURL || "",
          username: fields.username || "",
          caption: fields.caption || "",
          hashtags,
          music: fields.music || "",

          sponsor,
          originalVideoId: fields.originalVideoId || "",
          originalAudioId: fields.originalAudioId || "",
          isEnhanced,

          status: "pending",
          createdAt: new Date(),
        });
    } catch (firestoreError) {
      try {
        await deleteDriveFile(result.driveFileId);
      } catch (cleanupError) {
        console.error(
          "Drive cleanup failed after Firestore failure:",
          cleanupError
        );
      }

      console.error(
        "Moderation Firestore registration failed:",
        firestoreError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Moderation registration failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissionId,
    });
  } catch (error) {
    if (uploadedDriveFileId) {
      try {
        await deleteDriveFile(uploadedDriveFileId);
      } catch (cleanupError) {
        console.error(
          "Drive cleanup failed:",
          cleanupError
        );
      }
    }

    if (
      error instanceof Error &&
      error.message.includes("100MB")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Video exceeds the 100MB limit",
        },
        { status: 413 }
      );
    }

    console.error(
      "Creator moderation submission failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Video moderation submission failed",
      },
      { status: requestAborted ? 499 : 500 }
    );
  }
}
