"use client";

import { ShoppingBag } from "lucide-react";

export default function SponsoredCard() {
  const url = "https://jembeekart.com";
  
  return (
    <div 
      className="h-full w-full bg-black flex flex-col items-center justify-center text-white p-6 text-center cursor-pointer"
      onClick={() => window.open(url, '_blank')}
    >
      <div className="bg-white/10 p-4 rounded-full mb-6">
        <ShoppingBag size={48} className="text-yellow-500" />
      </div>
      <h2 className="text-4xl font-black mb-2">JembeeKart</h2>
      <p className="text-xl mb-2">Shop • Earn • Refer</p>
      <p className="text-sm text-yellow-500 mb-10 underline">https://jembeekart.com</p>
      <div className="w-full max-w-[200px] py-4 bg-yellow-500 text-black font-black rounded-full text-lg shadow-lg shadow-yellow-500/20">
        Open
      </div>
    </div>
  );
}
