"use client";

export default function PromotionBar() {
  const url = "https://jembeekart.com";
  
  return (
    <div 
      className="absolute bottom-16 left-0 right-0 z-40 bg-white/10 backdrop-blur-md border-t border-white/20 p-3 flex items-center justify-between text-white cursor-pointer hover:bg-white/20 transition"
      onClick={() => window.open(url, '_blank')}
    >
      <span className="text-sm font-bold truncate">🌐 Visit: jembeekart.com</span>
      <span className="text-xs font-semibold px-3 py-1 bg-white/20 rounded-full">Open</span>
    </div>
  );
}
