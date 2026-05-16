import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "JembeeKart",
  description: "AI Ecommerce Ecosystem"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body>

        <div className="w-full overflow-hidden">
          {children}
        </div>

      </body>

    </html>
  );
}
