"use client";

export const Button = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 rounded-xl bg-primary text-white hover:opacity-80 transition"
    >
      {children}
    </button>
  );
};
