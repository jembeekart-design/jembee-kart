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

      <body className="w-full overflow-x-hidden">
        {children}
      </body>

    </html>
  );
}
