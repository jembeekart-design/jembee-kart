"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Wallet,
  Landmark,
  Save,
  CheckCircle,
  CreditCard
} from "lucide-react";

export default function PaymentsPage() {

  const [cashfreeAppId, setCashfreeAppId] =
    useState("");

  const [cashfreeSecretKey, setCashfreeSecretKey] =
    useState("");

  const [stripeKey, setStripeKey] =
    useState("");

  const [codEnabled, setCodEnabled] =
    useState(true);

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg
