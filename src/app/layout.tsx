import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "JembeeKart",
  description: "AI Ecommerce Ecosystem",
  viewport: "width=device-width, initial-scale=1"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full overflow-x-hidden">
        <div className="w-full overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
