export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        fontFamily: "sans-serif",
      }}
    >
      {/* Glass Card */}
      <div
        style={{
          backdropFilter: "blur(16px)",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "20px",
          padding: "40px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          color: "white",
          maxWidth: "350px",
        }}
      >
        <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>
          JembeeKart 🚀
        </h1>

        <p style={{ opacity: 0.8, marginBottom: "20px" }}>
          Premium Glass UI eCommerce
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              background: "#6366f1",
              color: "white",
              cursor: "pointer",
            }}
          >
            Shop Now
          </button>

          <button
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            Admin
          </button>
        </div>
      </div>
    </main>
  );
}