"use client";
import { useParams } from "next/navigation";

export default function AudioPage() {
  const params = useParams();
  const audioId = decodeURIComponent(params.audioId as string);
  return (
    <main className="min-h-screen bg-black p-4 text-white">
      <h1 className="text-2xl font-black">Audio: {audioId}</h1>
      {/* UI implementation as per requirements */}
    </main>
  );
}