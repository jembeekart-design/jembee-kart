"use client";

export const Button = ({ children, onClick }: any) => {
  return (
    <button
      onClick={onClick}
      style={{
        background: "linear-gradient(135deg, var(--primary), var(--accent))",
        color: "#fff",
        padding: "10px 18px",
        borderRadius: "12px",
        border: "none",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
      }}
    >
      {children}
    </button>
  );
};
