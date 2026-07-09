"use client";

/* =======================================================
   FILE:
   src/components/admin/CloudinaryUploader.tsx
======================================================= */

import {
  useRef,
  useState
} from "react";

import {
  ImageIcon,
  Loader2,
  Upload,
  Video
} from "lucide-react";

import {
  uploadToCloudinary
} from "@/lib/cloudinary";

/* =======================================================
   TYPES
======================================================= */

interface CloudinaryUploaderProps {
  type?:
    | "image"
    | "video";

  value?: string;

  onChange: (
    url: string
  ) => void;
}

/* =======================================================
   COMPONENT
======================================================= */

export default function CloudinaryUploader({
  type = "image",

  value = "",

  onChange
}: CloudinaryUploaderProps) {
  /* ---------------- STATE ---------------- */

  const [loading, setLoading] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(
      null
    );

  /* ---------------- HANDLE UPLOAD ---------------- */

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

      alert(
        `${
          type === "image"
            ? "Image"
            : "Video"
        } Uploaded Successfully`
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

  /* ---------------- REMOVE ---------------- */

  function removeFile() {
    onChange("");
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-4">

      {/* PREVIEW BOX */}

      <div className="overflow-hidden rounded-[28px] border border-[var(--border-color)] bg-[var(--background-color)] shadow-lg">

        {/* IMAGE PREVIEW */}

        {value &&
        type ===
          "image" ? (
          <img
            src={value}
            alt="Uploaded"
            className="h-[260px] w-full object-cover"
          />
        ) : null}

        {/* VIDEO PREVIEW */}

        {value &&
        type ===
          "video" ? (
          <video
            src={value}
            controls
            className="h-[260px] w-full object-cover"
          />
        ) : null}

        {/* EMPTY */}

        {!value ? (
          <div className="flex h-[260px] flex-col items-center justify-center gap-4 text-[var(--muted-text-color)]">

            {type ===
            "image" ? (
              <ImageIcon
                size={70}
              />
            ) : (
              <Video
                size={70}
              />
            )}

            <p className="text-lg font-black">
              No{" "}
              {type ===
              "image"
                ? "Image"
                : "Video"}{" "}
              Uploaded
            </p>

          </div>
        ) : null}

      </div>

      {/* HIDDEN INPUT */}

      <input
        ref={fileInputRef}
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

      {/* BUTTONS */}

      <div className="flex gap-3">

        {/* UPLOAD */}

        <button
          type="button"
          onClick={() => {
            fileInputRef.current?.click();
          }}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-base font-black text-[var(--button-text-color)] shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />

              Uploading...
            </>
          ) : (
            <>
              <Upload />

              Upload{" "}
              {type}
            </>
          )}
        </button>

        {/* DELETE */}

        {value ? (
          <button
            type="button"
            onClick={
              removeFile
            }
            className="rounded-2xl bg-[var(--danger-color)] px-6 py-4 text-base font-black text-[var(--button-text-color)] shadow-xl transition-all duration-300 hover:bg-red-600"
          >
            Delete
          </button>
        ) : null}

      </div>

      {/* URL */}

      {value ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-4">

          <p className="mb-2 text-sm font-black text-[var(--text-color)]">
            Uploaded URL
          </p>

          <input
            type="text"
            value={value}
            readOnly
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] px-4 py-3 text-sm"
          />

        </div>
      ) : null}

    </div>
  );
}
