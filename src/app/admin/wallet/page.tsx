"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WalletPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/business-rules"); }, [router]);
  return <main className="flex min-h-screen items-center justify-center">Opening centralized wallet business rules…</main>;
}
