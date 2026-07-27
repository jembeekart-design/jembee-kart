"use client";

export default function PromotionBar() {
  const url = "https://jembeekart.com";
  
  return (
    <div 
      className="absolute bottom-40 left-4 right-4 z-40 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center justify-between text-white cursor-pointer hover:bg-black/80 transition"
      onClick={() => window.open(url, '_blank')}
    >
      <span className="text-sm font-bold truncate">🌐 Visit: jembeekart.com</span>
      <span className="text-xs font-semibold px-3 py-1 bg-white/20 rounded-full">Open</span>
    </div>
  );
}
