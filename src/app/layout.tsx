import type { Metadata } from "next";

import "./globals.css";

import Providers from "./providers";

export const metadata: Metadata = {
  title: "JembeeKart",

  description:
    "AI Ecommerce Ecosystem"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body>

        <Providers>

          <div className="w-full overflow-hidden">

            {children}

          </div>

        </Providers>

      </body>

    </html>
  );
}
