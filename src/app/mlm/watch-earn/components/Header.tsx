import React from 'react';
import { Flame, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WatchEarnHeader() {
  const router = useRouter();
  
  return (
    <div className="fixed top-0 z-50 flex w-full items-center justify-between p-4 text-white bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            Jembee Shorts <Flame size={20} className="text-orange-500 fill-orange-500" />
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/mlm/notifications")}
            className="p-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20"
          >
            <Bell size={20} />
          </button>
        </div>
      </div>
  );
}
