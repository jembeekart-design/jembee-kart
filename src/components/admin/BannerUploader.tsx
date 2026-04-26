'use client';

import { useEffect, useState } from "react";

type Props = {
  onChange: (file: File, preview: string) => void;
};

export default function BannerUploader({ onChange }: Props) {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);
  }, []);

  const handleFile = async (file: File) => {
    // 🔥 compress image
    const compressed = await compressImage(file);

    const previewUrl = URL.createObjectURL(compressed);

    setPreview(previewUrl);
    onChange(compressed, previewUrl);
  };

  return (
    <div className="space-y-3">
      {/* Upload Box */}
      <label className="glass p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition">
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) =>
            e.target.files && handleFile(e.target.files[0])
          }
        />

        <p className="text-sm opacity-70">
          Click to upload banner
        </p>

        <p className="text-xs opacity-50">
          Optimized automatically 🚀
        </p>
      </label>

      {/* Preview */}
      {preview && (
        <div className="glass p-3 rounded-xl">
          <img
            src={preview}
            alt=""
            className="w-full h-32 object-cover rounded-lg"
          />

          <p
            className="text-xs mt-2"
            style={{ color: themeColor }}
          >
            Preview Ready
          </p>
        </div>
      )}
    </div>
  );
}
