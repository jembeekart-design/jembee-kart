import type { Metadata } from "next";
import "../styles/globals.css"; // 🔥 Correct Path
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Jembee Kart Admin",
  description: "Premium Glassmorphism Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
