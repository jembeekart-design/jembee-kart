'use client';

import { useEffect, useState } from "react";
import BannerUploader from "./BannerUploader";

type Props = {
  initialData?: any;
  onSubmit: (data: any) => void;
};

export default function FestivalBannerForm({
  initialData,
  onSubmit,
}: Props) {
  const [themeColor, setThemeColor] = useState("#6366f1");

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState(1);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    if (initialData) {
      setTitle(initialData.title || "");
      setSubtitle(initialData.subtitle || "");
      setImagePreview(initialData.image || "");
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setPriority(initialData.priority || 1);
      setActive(initialData.active ?? true);
    }
  }, [initialData]);

  const handleImage = (file: File, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
  };

  const handleSubmit = () => {
    const data = {
      title,
      subtitle,
      image: imagePreview, // later upload to storage
      startDate,
      endDate,
      priority,
      active,
    };

    onSubmit(data);
  };

  return (
    <div className="space-y-5 text-white">
      <div className="glass p-6 rounded-2xl space-y-4">
        {/* Title */}
        <input
          type="text"
          placeholder="Banner Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20"
        />

        {/* Subtitle */}
        <input
          type="text"
          placeholder="Subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20"
        />

        {/* Image Upload */}
        <BannerUploader onChange={handleImage} />

        {/* Existing Preview (Edit mode) */}
        {!imageFile && imagePreview && (
          <img
            src={imagePreview}
            alt=""
            className="w-full h-32 object-cover rounded-xl"
          />
        )}

        {/* Dates */}
        <div className="grid md:grid-cols-2 gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-3 rounded-xl bg-white/10 border border-white/20"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-3 rounded-xl bg-white/10 border border-white/20"
          />
        </div>

        {/* Priority */}
        <input
          type="number"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="w-full p-2 rounded-lg bg-white/10 border border-white/20"
        />

        {/* Active Toggle */}
        <div className="flex items-center gap-3">
          <label>Active</label>

          <button
            onClick={() => setActive(!active)}
            className={`px-4 py-1 rounded-full text-sm ${
              active
                ? "bg-green-500/30 text-green-400"
                : "bg-red-500/30 text-red-400"
            }`}
          >
            {active ? "Active" : "Inactive"}
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="px-6 py-2 rounded-xl font-medium"
          style={{
            background: themeColor,
            boxShadow: `0 0 20px ${themeColor}55`,
          }}
        >
          Save Banner
        </button>
      </div>

      {/* Info */}
      <div className="glass p-3 rounded-xl text-sm opacity-70">
        Banner will show based on active status, date range, and priority.
      </div>
    </div>
  );
}
