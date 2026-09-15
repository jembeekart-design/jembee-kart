import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";

function getCloudinaryClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary server credentials are not configured"
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

export interface CloudinaryVideoUploadResult {
  secureUrl: string;
  publicId: string;
  thumbnailUrl: string;
  resourceType: string;
  eagerSecureUrl?: string;
}

export async function uploadVideoStreamToCloudinary(
  stream: Readable,
  options?: {
    folder?: string;
    publicId?: string;
    uploadPreset?: string;
  }
): Promise<CloudinaryVideoUploadResult> {
  const client = getCloudinaryClient();

  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        resource_type: "video",
        folder:
          options?.folder ||
          "jembeekart/watch-earn",
        public_id: options?.publicId,
        upload_preset:
          options?.uploadPreset,
        overwrite: false,
        invalidate: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(
            new Error(
              "Cloudinary returned an empty upload result"
            )
          );
          return;
        }

        if (
          typeof result.secure_url !== "string" ||
          typeof result.public_id !== "string"
        ) {
          reject(
            new Error(
              "Invalid Cloudinary upload result"
            )
          );
          return;
        }

        const thumbnailUrl =
          result.secure_url
            .replace(
              "/video/upload/",
              "/video/upload/so_1/"
            )
            .replace(
              /\.mp4($|\?)/i,
              ".jpg$1"
            );

        let eagerSecureUrl: string | undefined;

        if (Array.isArray(result.eager)) {
          const first = result.eager[0];

          if (
            first &&
            typeof first === "object" &&
            "secure_url" in first &&
            typeof first.secure_url === "string"
          ) {
            eagerSecureUrl = first.secure_url;
          }
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          thumbnailUrl,
          resourceType:
            result.resource_type || "video",
          eagerSecureUrl,
        });
      }
    );

    stream.on("error", reject);
    uploadStream.on("error", reject);

    stream.pipe(uploadStream);
  });
}

export async function deleteCloudinaryVideo(
  publicId: string
): Promise<void> {
  const trimmedPublicId = publicId.trim();

  if (!trimmedPublicId) {
    return;
  }

  const client = getCloudinaryClient();

  await client.uploader.destroy(
    trimmedPublicId,
    {
      resource_type: "video",
      invalidate: true,
    }
  );
}
