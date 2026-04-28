'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header({
  themeColor,
  setThemeColor,
  darkMode,
  setDarkMode,
}: any) {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", themeColor);
  }, [themeColor]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/login");
  };

  return (
    <header
      className="glass"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* LEFT */}
      <h2 style={{ fontSize: "14px", fontWeight: 600 }}>
        Welcome 👋
      </h2>

      {/* RIGHT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* 🎨 COLOR DOT */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setShowPicker(!showPicker)}
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: themeColor,
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
            }}
          />

          {showPicker && (
            <div
              className="glass"
              style={{
                position: "absolute",
                right: 0,
                marginTop: "6px",
                padding: "6px",
                borderRadius: "10px",
                display: "flex",
                gap: "6px",
              }}
            >
              {["#6366f1", "#22c55e", "#ef4444", "#f59e0b"].map((c) => (
                <div
                  key={c}
                  onClick={() => {
                    setThemeColor(c);
                    setShowPicker(false);
                  }}
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: c,
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 🌙 DARK MODE */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            fontSize: "14px",
            padding: "4px 6px",
            borderRadius: "6px",
            border: `1px solid ${themeColor}`,
            color: themeColor,
            background: "transparent",
          }}
        >
          {darkMode ? "🌙" : "☀️"}
        </button>

        {/* 🔔 NOTIFICATION */}
        <div style={{ position: "relative" }}>
          <span style={{ fontSize: "16px" }}>🔔</span>
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-6px",
              fontSize: "9px",
              background: "red",
              color: "#fff",
              borderRadius: "50%",
              padding: "1px 4px",
            }}
          >
            3
          </span>
        </div>

        {/* 🚪 LOGOUT */}
        <button
          onClick={handleLogout}
          style={{
            fontSize: "12px",
            padding: "4px 8px",
            borderRadius: "6px",
            background: "rgba(255,0,0,0.15)",
            color: "#ff4d4f",
            border: "none",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
