"use client";

export const Button = ({ children, onClick }: any) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 18px",
        borderRadius: "12px",
        border: "none",
        background: "var(--primary)",
        color: "white",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
};