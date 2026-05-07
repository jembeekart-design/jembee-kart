"use client";

import { useThemeStore } from "@/shared/store/themeStore";

export default function ThemePanel() {
  const { setTheme } = useThemeStore();

  return (
    <div className="glass rounded-[32px] p-6">

      <h2 className="mb-6 text-3xl font-black">
        Theme Control
      </h2>

      <div className="grid grid-cols-3 gap-4">

        <button
          onClick={() =>
            setTheme(
              "#06b6d4",
              "#3b82f6",
              "#22c55e"
            )
          }
          className="h-24 rounded-[24px] bg-gradient-to-br from-cyan-500 to-blue-500"
        />

        <button
          onClick={() =>
            setTheme(
              "#8b5cf6",
              "#6366f1",
              "#ec4899"
            )
          }
          className="h-24 rounded-[24px] bg-gradient-to-br from-violet-500 to-indigo-500"
        />

        <button
          onClick={() =>
            setTheme(
              "#f97316",
              "#ef4444",
              "#f59e0b"
            )
          }
          className="h-24 rounded-[24px] bg-gradient-to-br from-orange-500 to-red-500"
        />

      </div>

    </div>
  );
}
