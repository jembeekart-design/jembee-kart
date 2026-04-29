cat > src/app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #0f172a, #1e293b)"
    }}>
      <h1 style={{
        fontSize: "32px",
        color: "white",
        backdropFilter: "blur(12px)",
        padding: "20px 40px",
        borderRadius: "14px",
        background: "rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
      }}>
        JembeeKart 🚀
      </h1>
    </main>
  )
}
EOF