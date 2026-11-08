"use client";

import { useState } from "react";

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: string;
  className?: string;
}

export default function Avatar({ name, photoUrl, size = "h-24 w-24", className = "" }: AvatarProps) {
  const [error, setError] = useState(false);

  // Deterministic color based on name
  const stringToColor = (string: string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  const bgColor = stringToColor(name || "U");

  if (photoUrl && !error) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${size} rounded-full object-cover ${className}`}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full flex items-center justify-center text-white font-black text-3xl ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {name ? name.charAt(0).toUpperCase() : "U"}
    </div>
  );
}
