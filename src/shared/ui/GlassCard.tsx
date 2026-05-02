"use client";

export const GlassCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        background: "var(--card)",
        backdropFilter: "blur(var(--blur))",
        borderRadius: "20px",
        padding: "20px",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      {children}
    </div>
  );
};
