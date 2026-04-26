'use client';

import { useEffect, useState } from "react";

export default function ImportQikinkPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [margin, setMargin] = useState(150);

  // 🔥 Production Level Dynamic Fetch (Pseudo-Logic)
  const fetchProduct = async () => {
    if (!url) return;
    setLoading(true);

    // Simulate different data based on URL keywords
    setTimeout(() => {
      let mockData = {
        name: "Custom Printed T-Shirt",
        price: 399,
        image: "https://via.placeholder.com/300/6366f1/ffffff?text=T-Shirt",
        sku: "QK-TS-102"
      };

      if (url.toLowerCase().includes("hoodie")) {
        mockData = {
          name: "Premium Winter Hoodie",
          price: 899,
          image: "https://via.placeholder.com/300/a855f7/ffffff?text=Hoodie",
          sku: "QK-HD-504"
        };
      } else if (url.toLowerCase().includes("mug")) {
        mockData = {
          name: "Ceramic Coffee Mug",
          price: 199,
          image: "https://via.placeholder.com/300/ec4899/ffffff?text=Mug",
          sku: "QK-MG-901"
        };
      }

      setProduct(mockData);
      setLoading(false);
    }, 1200);
  };

  const finalPrice = product ? product.price + Number(margin) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🚀 Header Area */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tight text-white">
          🔗 Import <span className="text-[var(--primary)]">Qikink</span>
        </h1>
        <p className="text-white/40 text-xs uppercase tracking-[3px] font-bold">Inventory Sync System</p>
      </div>

      {/* 🧊 Premium Input Card */}
      <div className="glass-guardian p-8 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-10 blur-[50px] -mr-10 -mt-10" />
        
        <div className="max-w-xl space-y-5 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Paste Qikink Product URL</label>
            <input
              type="text"
              placeholder="e.g. dashboard.qikink.com/products/view/12345"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full glass-normal p-4 text-sm outline-none border-white/10 focus:border-[var(--primary)] transition-all bg-white/5"
            />
          </div>

          <button
            onClick={fetchProduct}
            disabled={loading || !url}
            className="btn-guardian w-full md:w-auto px-10 py-4 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><span>⚡</span> Fetch Details</>
            )}
          </button>
        </div>
      </div>

      {/* 🎭 Product Preview Glass Stage */}
      {product && (
        <div className="glass-normal p-1 overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="grid md:grid-cols-2 gap-0">
            
            {/* Image Section */}
            <div className="bg-white/5 p-8 flex items-center justify-center border-r border-white/5">
              <div className="relative group">
                <div className="absolute inset-0 bg-[var(--primary)] opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
                <img
                  src={product.image}
                  alt={product.name}
                  className="relative w-64 h-64 rounded-2xl object-cover shadow-2xl border border-white/10"
                />
              </div>
            </div>

            {/* Config Section */}
            <div className="p-8 space-y-6">
              <div>
                <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/10 px-3 py-1 rounded-full border border-[var(--primary)]/20">
                  {product.sku}
                </span>
                <h2 className="text-2xl font-black text-white mt-3">{product.name}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-normal bg-white/5 p-4 border-none">
                  <p className="text-[10px] font-bold text-white/30 uppercase mb-1">Base Price</p>
                  <p className="text-xl font-bold text-white">₹{product.price}</p>
                </div>

                <div className="glass-normal bg-white/5 p-4 border-[var(--primary)]/30">
                  <p className="text-[10px] font-bold text-white/30 uppercase mb-1">Set Margin</p>
                  <div className="flex items-center text-[var(--primary)]">
                    <span className="font-bold mr-1">₹</span>
                    <input
                      type="number"
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      className="bg-transparent font-black text-xl outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 glass-guardian border-none bg-gradient-to-r from-[var(--primary)]/20 to-transparent flex justify-between items-center">
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Final Profit Price</span>
                <span className="text-3xl font-black text-white">₹{finalPrice}</span>
              </div>

              <button className="btn-guardian w-full py-5 text-sm font-black uppercase tracking-[2px]">
                Confirm & Save to Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ℹ️ Guide Footer */}
      <div className="glass-normal p-6 border-l-4 border-[var(--primary)]/50 bg-white/[0.02]">
        <div className="flex gap-4">
          <span className="text-xl">🛠️</span>
          <p className="text-xs text-white/40 leading-relaxed font-medium">
            <strong className="text-white/60">Note:</strong> Hum Qikink API se real-time stock aur color variants fetch karte hain. Margins ko set karte waqt 2% transaction fee ka dhyan rakhein.
          </p>
        </div>
      </div>
    </div>
  );
}
