import "@/styles/globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata = {
  title: "JembeeKart",
  description: "Production Ecommerce Admin",

  // 🔥 status bar color (initial)
  themeColor: "#0f172a",

  // 📱 mobile viewport
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "var(--bg)",
          color: "var(--text)",
        }}
      >
        {/* 🔥 ONE TIME GLOBAL THEME */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
