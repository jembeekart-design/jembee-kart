import "./globals.css"; // 🔥 THIS IS REQUIRED

export const metadata = {
  title: "JembeeKart",
  description: "Premium Ecommerce App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-text">
        {children}
      </body>
    </html>
  );
}
