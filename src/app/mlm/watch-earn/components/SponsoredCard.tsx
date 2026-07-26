"use client";

export default function SponsoredCard() {
  const url = "https://jembeekart.com";
  
  return (
    <div className="h-full w-full bg-gradient-to-b from-purple-900 to-black flex flex-col items-center justify-center text-white p-6 text-center">
      <h2 className="text-3xl font-black mb-2">JEMBEEKART</h2>
      <p className="text-lg mb-8 opacity-80">Shop • Earn • Refer</p>
      <button 
        onClick={() => window.open(url, '_blank')}
        className="px-8 py-3 bg-white text-purple-900 font-black rounded-full text-lg hover:bg-gray-200 transition"
      >
        Open JembeeKart
      </button>
    </div>
  );
}
