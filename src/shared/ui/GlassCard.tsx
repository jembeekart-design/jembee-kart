export const GlassCard = ({ children }: any) => {
  return (
    <div
      style={{
        backdropFilter: "blur(var(--glass-blur))",
        background: "rgba(255,255,255,var(--glass-opacity))",
        borderRadius: "16px",
        padding: "16px",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      {children}
    </div>
  );
};