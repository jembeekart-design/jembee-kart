"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WithdrawalsPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/withdrawal-requests"); }, [router]);
  return <main className="flex min-h-screen items-center justify-center">Opening the live withdrawal queue…</main>;
}
