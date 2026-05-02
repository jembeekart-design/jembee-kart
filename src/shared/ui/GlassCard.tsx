"use client";

export const GlassCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="glass p-6 rounded-2xl border border-white/20 shadow-xl">
      {children}
    </div>
  );
};
