'use client';

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-root bg-[var(--bg)]">

      {/* 🎭 BACKGROUND GUARDIAN GLOW */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--primary)] opacity-[0.05] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--primary)] opacity-[0.05] blur-[100px]" />
      </div>

      {/* 🚀 SIDEBAR */}
      <Sidebar />

      {/* ⚡ MAIN CONTENT */}
      <div className="admin-main">

        {/* HEADER */}
        <Header />

        {/* CONTENT */}
        <main className="admin-scroll">

          <div className="glass card glow">
            {children}
          </div>

          {/* FOOTER */}
          <footer className="admin-footer">
            Jembee Kart Dashboard © 2026 • Production Label
          </footer>

        </main>
      </div>
    </div>
  );
}
