import "@/styles/globals.css";
import ThemeProvider from "@/components/admin/ThemeProvider";

export const metadata = {
  title: "JembeeKart",
  description: "Production Ecommerce Admin",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 🔝 Status Bar */}
        <meta name="theme-color" content="#0f172a" />

        {/* 📱 Mobile PWA Support */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>

      <body
        style={{
          background: "var(--bg)",
          color: "var(--text)",
        }}
      >
        {/* 🔥 Global Theme System */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
