import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { ThemeLoader } from "@/components/ThemeLoader"; // Ye file hum banayenge

export const metadata: Metadata = {
  title: "JembeeKart",
  description: "AI Ecommerce Ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {/* ThemeLoader yahan data fetch karke CSS variables update karega */}
          <ThemeLoader>
            <div className="w-full overflow-hidden">
              {children}
            </div>
          </ThemeLoader>
        </Providers>
      </body>
    </html>
  );
}
