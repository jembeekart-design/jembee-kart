import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "JembeeKart",
  description: "AI Ecommerce Ecosystem",
  viewport: "width=device-width, initial-scale=1"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body className="overflow-x-hidden bg-gray-100">
        {children}
      </body>

    </html>
  );
}
