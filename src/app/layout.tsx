import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "JembeeKart",
  description: "AI Powered Ecommerce Ecosystem"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body>
        {children}
      </body>

    </html>
  );
}
