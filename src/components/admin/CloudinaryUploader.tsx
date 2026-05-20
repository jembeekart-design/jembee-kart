"use client";

import {
  useRef,
  useState
} from "react";

import {
  Image,
  Upload,
  Video,
  Loader2
} from "lucide-react";

import {
  uploadToCloudinary
} from "@/lib/cloudinary";

interface Props {
  type?: "image" | "video";

  value?: string;

  onChange: (
    url: string
  ) => void;
}

export default function CloudinaryUploader({
  type = "image",

  value,

  onChange
}: Props) {
  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    try {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      setLoading(true);

      const response =
        await uploadToCloudinary(
          file,
          type
        );

      onChange(
        response.secure_url
      );
    } catch (error) {
      console.error(error);

      alert(
        "Upload Failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">

      {/* PREVIEW */}

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-100">

        {value ? (
          type === "image" ? (
            <img
              src={value}
              alt="preview"
              className="h-64 w-full object-cover"
            />
          ) : (
            <video
              src={value}
              controls
              className="h-64 w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-400">

            {type ===
            "image" ? (
              <Image
                size={60}
              />
            ) : (
              <Video
                size={60}
              />
            )}

            <p className="font-bold">
              No File Uploaded
            </p>

          </div>
        )}

      </div>

      {/* INPUT */}

      <input
        ref={inputRef}
        type="file"
        accept={
          type === "image"
            ? "image/*"
            : "video/*"
        }
        onChange={
          handleUpload
        }
        className="hidden"
      />

      {/* BUTTON */}

      <button
        type="button"
        onClick={() => {
          inputRef.current?.click();
        }}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-lg font-black text-white shadow-xl"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />

            Uploading...
          </>
        ) : (
          <>
            <Upload />

            Upload {type}
          </>
        )}
      </button>

    </div>
  );
}
