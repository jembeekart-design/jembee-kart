'use client';

import { useState } from "react";

type Props = {
  onChange: (file: File, preview: string) => void;
};

export default function BannerUploader({ onChange }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    // ❌ NO compression (direct use)
    const previewUrl = URL.createObjectURL(file);

    setPreview(previewUrl);

    // send data to parent
    onChange(file, previewUrl);
  };

  return (
    <div className="glass card">

      <h3>📸 Upload Banner</h3>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* 🔥 Preview */}
      {preview && (
        <div style={{ marginTop: 20 }}>
          <img
            src={preview}
            alt="preview"
            style={{
              width: "100%",
              borderRadius: "12px",
            }}
          />
        </div>
      )}
    </div>
  );
}
