'use client';

import { useEffect, useState } from "react";

type Props = {
  label?: string;
  value: string;
  onChange: (color: string) => void;
};

export default function ColorPicker({
  label = "Select Color",
  value,
  onChange,
}: Props) {
  const [color, setColor] = useState(value);

  useEffect(() => {
    setColor(value);
  }, [value]);

  const handleChange = (newColor: string) => {
    setColor(newColor);
    onChange(newColor);

    // Apply globally
    document.documentElement.style.setProperty(
      "--primary",
      newColor
    );
  };

  return (
    <div className="glass p-4 rounded-xl space-y-3 text-white">
      {/* Label */}
      <p className="text-sm opacity-70">{label}</p>

      {/* Input + Picker */}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={color}
          onChange={(e) => handleChange(e.target.value)}
          className="w-10 h-10 cursor-pointer"
        />

        <input
          type="text"
          value={color}
          onChange={(e) => handleChange(e.target.value)}
          className="p-2 rounded-lg bg-white/10 border border-white/20 text-sm w-28"
        />
      </div>

      {/* Presets */}
      <div className="flex gap-2">
        {[
          "#6366f1",
          "#22c55e",
          "#ef4444",
          "#f59e0b",
          "#0ea5e9",
          "#8b5cf6",
          "#ec4899",
        ].map((preset) => (
          <div
            key={preset}
            onClick={() => handleChange(preset)}
            className="w-6 h-6 rounded-full cursor-pointer border"
            style={{
              background: preset,
              border:
                color === preset
                  ? "2px solid white"
                  : "1px solid gray",
            }}
          />
        ))}
      </div>

      {/* Preview */}
      <div className="glass p-3 rounded-lg">
        <button
          className="px-4 py-2 rounded-xl font-medium"
          style={{
            background: color,
            boxShadow: `0 0 15px ${color}55`,
          }}
        >
          Preview Button
        </button>
      </div>
    </div>
  );
}
