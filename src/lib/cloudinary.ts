import { auth } from "@/firebase/config";
/* =======================================================
   FILE:
   src/lib/cloudinary.ts
======================================================= */

/* =======================================================
   TYPES
======================================================= */

export interface CloudinaryUploadResponse {
  secure_url: string;

  public_id: string;

  resource_type: string;

  format: string;

  width?: number;

  height?: number;

  duration?: number;
}

/* =======================================================
   IMAGE COMPRESS FUNCTION
======================================================= */

export async function compressImage(
  file: File
): Promise<File> {
  return new Promise(
    (resolve) => {
      const image =
        new Image();

      const reader =
        new FileReader();

      reader.readAsDataURL(
        file
      );

      reader.onload = (
        event
      ) => {
        image.src =
          event.target
            ?.result as string;
      };

      image.onload = () => {
        const canvas =
          document.createElement(
            "canvas"
          );

        const MAX_WIDTH = 1600;

        const scaleSize =
          MAX_WIDTH /
          image.width;

        canvas.width =
          MAX_WIDTH;

        canvas.height =
          image.height *
          scaleSize;

        const context =
          canvas.getContext(
            "2d"
          );

        context?.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);

              return;
            }

            const compressedFile =
              new File(
                [blob],
                file.name,
                {
                  type:
                    "image/jpeg"
                }
              );

            resolve(
              compressedFile
            );
          },

          "image/jpeg",

          0.7
        );
      };
    }
  );
}

/* =======================================================
   CLOUDINARY IMAGE / VIDEO UPLOAD
======================================================= */

export async function uploadToCloudinary(
  file: File,

  resourceType:
    | "image"
    | "video" = "image"
): Promise<CloudinaryUploadResponse> {
  try {
    /* ---------------- ENV ---------------- */

    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Please sign in before uploading.");
    const idToken = await currentUser.getIdToken();

    /* ---------------- IMAGE COMPRESS ---------------- */

    let uploadFile =
      file;

    if (
      resourceType ===
      "image"
    ) {
      uploadFile =
        await compressImage(
          file
        );
    }

    /* ---------------- SERVER-SIGNED UPLOAD ---------------- */
    const signatureResponse = await fetch("/api/cloudinary/signature", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ resourceType, mimeType: uploadFile.type, fileSize: uploadFile.size }),
      cache: "no-store",
    });
    const signed = await signatureResponse.json().catch(() => ({}));
    if (!signatureResponse.ok || signed.success !== true || typeof signed.signature !== "string" || typeof signed.uploadPreset !== "string") throw new Error(signed.message || "Signed upload authorization failed");

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("api_key", signed.apiKey);
    formData.append("timestamp", String(signed.timestamp));
    formData.append("folder", signed.folder);
    formData.append("public_id", signed.publicId);
    formData.append("overwrite", "false");
    formData.append("upload_preset", signed.uploadPreset);
    formData.append("signature", signed.signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signed.cloudName}/${resourceType}/upload`,
      { method: "POST", body: formData, cache: "no-store" }
    );

    /* ---------------- ERROR ---------------- */

    if (!response.ok) {
      let details = "";
      try {
        const body = await response.json();
        details =
          typeof body?.error?.message === "string"
            ? body.error.message
            : JSON.stringify(body);
      } catch {
        details = await response.text().catch(() => "");
      }

      console.error("Cloudinary HTTP Error:", {
        status: response.status,
        details: details.slice(0, 1000),
      });

      throw new Error(
        `Cloudinary Upload Failed (${response.status}): ${details.slice(0, 300)}`
      );
    }

    /* ---------------- RESPONSE ---------------- */

    const data =
      await response.json();

    return {
      secure_url:
        data.secure_url,

      public_id:
        data.public_id,

      resource_type:
        data.resource_type,

      format:
        data.format,

      width:
        data.width,

      height:
        data.height,

      duration:
        data.duration
    };
  } catch (error) {
    console.error(
      "Cloudinary Upload Error:",
      error
    );

    throw error;
  }
}

/* =======================================================
   DELETE FILE
======================================================= */

export async function deleteCloudinaryFile(
  publicId: string
) {
  try {
    console.log(
      "Delete File:",
      publicId
    );

    /*
      NOTE:
      Real delete backend API se hota hai.
      Frontend-only app me normally firestore
      se URL remove karte hain.
    */

    return true;
  } catch (error) {
    console.error(error);

    return false;
  }
}

/* =======================================================
   GET OPTIMIZED IMAGE URL
======================================================= */

export function getOptimizedImage(
  url: string
) {
  if (!url) {
    return "";
  }

  return url.replace(
    "/upload/",
    "/upload/f_auto,q_auto/"
  );
}

/* =======================================================
   GET VIDEO THUMBNAIL
======================================================= */

export function getVideoThumbnail(
  url: string
) {
  if (!url) {
    return "";
  }

  return url.replace(
    "/video/upload/",
    "/video/upload/so_1/"
  );
}
