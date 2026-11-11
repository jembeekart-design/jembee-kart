"use client";

import { useRouter } from "next/navigation";

export default function PromotionBar() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="absolute bottom-40 left-4 right-4 z-40 flex items-center justify-between rounded-xl border border-white/10 bg-black/60 p-3 text-left text-white backdrop-blur-md transition hover:bg-black/80"
      onClick={() => router.push("/learn/school")}
    >
      <span className="truncate text-sm font-bold">Explore School Learning</span>
      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Open</span>
    </button>
  );
}
