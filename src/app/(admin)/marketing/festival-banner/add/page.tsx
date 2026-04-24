'use client';

import { useEffect, useState } from "react";

export default function AddFestivalBanner() {
  const [themeColor, setThemeColor] = useState("#6366f1");

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);
  const [priority, setPriority] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);
  }, []);

  const handleSubmit = () => {
    const data = {
      title,
      subtitle,
      startDate,
      endDate,
      active,
      priority,
    };

    console.log("Banner Data:", data);

    alert("Banner Saved (Firestore later)");
  };

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">
        ➕ Add Festival Banner
      </h1>

      <div className="glass p-6 rounded-2xl space-y-4">
        {/* Title */}
        <input
          type="text"
          placeholder="Banner Title (e.g. Diwali Sale 🎉)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none"
        />

        {/* Subtitle */}
        <input
          type="text"
          placeholder="Subtitle (e.g. Flat 50% OFF)"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none"
        />

        {/* Image Upload */}
        <div>
          <label className="text-sm opacity-70">
            Upload Banner Image
          </label>

          <input
            type="file"
            onChange={(e) =>
              setImage(e.target.files?.[0] || null)
            }
            className="w-full mt-1 text-sm"
          />
        </div>

        {/* Dates */}
        <div className="grid md:grid-cols-2 gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
            className="p-3 rounded-xl bg-white/10 border border-white/20"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
            className="p-3 rounded-xl bg-white/10 border border-white/20"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="text-sm opacity-70">
            Priority (Higher = Top)
          </label>

          <input
            type="number"
            value={priority}
            onChange={(e) =>
              setPriority(Number(e.target.value))
            }
            className="w-full p-2 mt-1 rounded-lg bg-white/10 border border-white/20"
          />
        </div>

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

        {/* Save Button */}
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
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        Only active banners within date range will be shown. Priority controls display order.
      </div>
    </div>
  );
}
