'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  startDate: string;
  endDate: string;
  active: boolean;
};

export default function FestivalBannerPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    // Dummy data (later Firestore)
    setBanners([
      {
        id: "1",
        title: "Diwali Sale 🎉",
        subtitle: "Flat 50% OFF",
        image: "https://via.placeholder.com/300x120",
        startDate: "2024-11-01",
        endDate: "2024-11-10",
        active: true,
      },
      {
        id: "2",
        title: "New Year Sale 🎊",
        subtitle: "Buy 1 Get 1",
        image: "https://via.placeholder.com/300x120",
        startDate: "2025-01-01",
        endDate: "2025-01-05",
        active: false,
      },
    ]);
  }, []);

  const toggleActive = (id: string) => {
    setBanners((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, active: !b.active } : b
      )
    );
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🎉 Festival Banners</h1>

        <Link href="/marketing/festival-banner/add">
          <button
            className="px-5 py-2 rounded-xl font-medium"
            style={{
              background: themeColor,
              boxShadow: `0 0 20px ${themeColor}55`,
            }}
          >
            + Add Banner
          </button>
        </Link>
      </div>

      {/* Banner List */}
      <div className="space-y-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="glass p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center"
          >
            {/* Image */}
            <img
              src={banner.image}
              alt=""
              className="w-full md:w-60 h-28 object-cover rounded-xl"
            />

            {/* Info */}
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-semibold">
                {banner.title}
              </h2>
              <p className="text-sm opacity-70">
                {banner.subtitle}
              </p>
              <p className="text-xs opacity-50">
                {banner.startDate} → {banner.endDate}
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-2 items-center">
              {/* Toggle */}
              <button
                onClick={() => toggleActive(banner.id)}
                className={`px-4 py-1 rounded-full text-sm ${
                  banner.active
                    ? "bg-green-500/30 text-green-400"
                    : "bg-red-500/30 text-red-400"
                }`}
              >
                {banner.active ? "Active" : "Inactive"}
              </button>

              {/* Edit */}
              <Link href={`/marketing/festival-banner/edit/${banner.id}`}>
                <button
                  className="px-3 py-1 rounded-lg text-sm"
                  style={{
                    border: `1px solid ${themeColor}`,
                    color: themeColor,
                  }}
                >
                  Edit
                </button>
              </Link>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="text-center opacity-50">
            No banners added yet
          </div>
        )}
      </div>

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        Only active banners within the date range will be shown on the homepage.
      </div>
    </div>
  );
}
