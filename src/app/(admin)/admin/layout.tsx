'use client';

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

/**
 * PRODUCTION NOTES:
 * 1. Props drilling ko khatam kiya gaya hai (Header ab direct CSS variables handle karega).
 * 2. Guardian Glow inject kiya gaya hai jo background mein theme ke hisaab se chamkega.
 * 3. Layout shifts ko prevent karne ke liye fixed structure use kiya hai.
 */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[var(--bg)] transition-colors duration-500 overflow-hidden">
      
      {/* 🎭 BACKGROUND GUARDIAN GLOW (Halka sa chamakdar background) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--primary)] opacity-[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--guardian-end,var(--primary))] opacity-[0.03] blur-[100px]" />
      </div>

      {/* 🚀 SIDEBAR: Glass-Guardian Styled */}
      <Sidebar />

      {/* ⚡ MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        
        {/* 🛠 HEADER: Admin Control Center */}
        <Header />

        {/* 📦 SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          
          {/* Glass Card Container (The Production Stage) */}
          <div className="glass-guardian min-h-full transition-all duration-500 ease-in-out">
            
            {/* Inner Padding Surface */}
            <div className="p-4 md:p-8">
              {children}
            </div>

          </div>

          {/* Footer / Copyright (Optional Premium Touch) */}
          <footer className="mt-8 pb-4 text-center opacity-30 text-[10px] tracking-[2px] uppercase">
            Jembee Kart Dashboard © 2026 • Production Label
          </footer>
        </main>
      </div>
    </div>
  );
}
