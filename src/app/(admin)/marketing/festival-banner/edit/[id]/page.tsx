'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EditFestivalBanner() {
  const { id } = useParams();

  const [themeColor, setThemeColor] = useState("#6366f1");

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState<string>("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);
  const [priority, setPriority] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    // 🔥 Dummy fetch (replace with Firestore)
    setTitle("Diwali Sale 🎉");
    setSubtitle("Flat 50% OFF");
    setImage("https://via.placeholder.com/300x120");
    setStartDate("2024-11-01");
    setEndDate("2024-11-10");
    setActive(true);
    setPriority(1);
  }, [id]);

  const handleUpdate = () => {
    const data = {
      id,
      title,
      subtitle,
      startDate,
      endDate,
      active,
      priority,
    };

    console.log("Updated Banner:", data);
    alert("Banner Updated (Firestore later)");
  };

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">
        ✏️ Edit Festival Banner
      </h1>

      <div className="glass p-6 rounded-2xl space-y-4">
        {/* Image Preview */}
        {image && (
          <img
            src={image}
            alt=""
            className="w-full max-w-md h-32 object-cover rounded-xl"
          />
        )}

        {/* Title */}
        <input
          type="text"
          placeholder="Banner Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none"
        />

        {/* Subtitle */}
        <input
          type="text"
          placeholder="Subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none"
        />

        {/* Replace Image */}
        <input
          type="file"
          onChange={(e) =>
            setImage(URL.createObjectURL(e.target.files?.[0]!))
          }
          className="w-full text-sm"
        />

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
          onChange={(e) =>
            setPriority(Number(e.target.value))
          }
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

        {/* Update Button */}
        <button
          onClick={handleUpdate}
          className="px-6 py-2 rounded-xl font-medium"
          style={{
            background: themeColor,
            boxShadow: `0 0 20px ${themeColor}55`,
          }}
        >
          Update Banner
        </button>
      </div>

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        Edit banner details. Only active banners within date range will be shown.
      </div>
    </div>
  );
}
