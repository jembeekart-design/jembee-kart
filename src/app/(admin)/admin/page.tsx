'use client';

import { useEffect, useState } from "react";

// Production Stats with Icons
const stats = [
  { title: "Total Products", value: "120", icon: "🛒", trend: "+12%" },
  { title: "Total Orders", value: "45", icon: "📦", trend: "+5%" },
  { title: "Revenue", value: "₹12,500", icon: "💰", trend: "+18%" },
  { title: "Active Banners", value: "3", icon: "🎨", trend: "0%" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 🚀 Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            Dashboard <span className="text-[var(--primary)] text-lg font-medium opacity-50 ml-2">Overview</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Welcome back, Managing your production ecosystem.</p>
        </div>
        
        {/* Date Display (Premium Touch) */}
        <div className="glass-normal px-4 py-2 text-xs font-bold tracking-widest uppercase text-white/60">
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* 📊 Stats Grid: Using Premium Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="glass-guardian group hover:scale-[1.02] transition-all duration-300 p-6 flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex justify-between items-start">
              <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{item.icon}</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                {item.trend}
              </span>
            </div>
            
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-white/40 font-bold">{item.title}</p>
              <h2 className="text-3xl font-black text-white mt-1 group-hover:text-[var(--primary)] transition-colors">
                {item.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* ⚡ Quick Actions Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: "Add Product", desc: "Import from Qikink API", action: "Import Now", color: "from-blue-500" },
          { title: "Festival Banner", desc: "Manage homepage UI", action: "Configure", color: "from-purple-500" },
          { title: "Flash Sale", desc: "Time-limited offers", action: "Create Sale", color: "from-orange-500" }
        ].map((action, i) => (
          <div key={i} className="glass-normal p-6 hover:border-white/30 transition-all group cursor-pointer">
            <h2 className="text-xl font-bold mb-1 group-hover:text-[var(--primary)] transition-colors">{action.title}</h2>
            <p className="text-sm text-white/50 mb-6">{action.desc}</p>
            <button className="w-full py-3 text-xs font-bold uppercase tracking-widest rounded-xl bg-white/5 hover:bg-[var(--primary)] transition-all">
              {action.action}
            </button>
          </div>
        ))}
      </div>

      {/* 📦 Activity & Tasks Wrapper */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-guardian p-8">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
            Recent Activity
          </h2>
          <div className="space-y-6">
            {[
              { text: "New order #8292 received", time: "2 mins ago" },
              { text: "Qikink sync successful", time: "1 hour ago" },
              { text: "Flash sale 'Summer24' ended", time: "5 hours ago" }
            ].map((activity, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-sm text-white/70">✔️ {activity.text}</span>
                <span className="text-[10px] text-white/30 font-bold uppercase">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 📈 Quick System Check */}
        <div className="glass-normal p-8 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin mb-4" />
          <h3 className="font-bold text-lg">System Healthy</h3>
          <p className="text-sm text-white/40">Vercel Deployment: Live</p>
          <div className="mt-6 px-6 py-2 rounded-full bg-[var(--primary)] text-[10px] font-black uppercase tracking-tighter">
            Production Ready
          </div>
        </div>
      </div>
    </div>
  );
}
