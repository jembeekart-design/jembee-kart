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

    const cloudName =
      process.env
        .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env
        .NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName) {
      throw new Error(
        "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME Missing"
      );
    }

    if (!uploadPreset) {
      throw new Error(
        "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET Missing"
      );
    }

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

    /* ---------------- FORM DATA ---------------- */

    const formData =
      new FormData();

    formData.append(
      "file",
      uploadFile
    );

    formData.append(
      "upload_preset",
      uploadPreset
    );

    formData.append(
      "folder",
      "jembeekart"
    );

    /* ---------------- API CALL ---------------- */

    const response =
      await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        {
          method: "POST",

          body: formData
        }
      );

    /* ---------------- ERROR ---------------- */

    if (!response.ok) {
      throw new Error(
        "Cloudinary Upload Failed"
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
