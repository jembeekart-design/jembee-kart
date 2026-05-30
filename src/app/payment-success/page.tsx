"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

export default function PaymentSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    async function activateMLM() {
      try {
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setLoading(false);
          return;
        }

        const userData = userSnap.data();

        let finalReferralCode =
          userData.referralCode || "";

        // Generate referral code only once
        if (!finalReferralCode) {
          finalReferralCode =
            "JBK" +
            Math.random()
              .toString(36)
              .substring(2, 8)
              .toUpperCase();
        }

        const updatePayload: any = {
          mlmActive: true,
          referralCode: finalReferralCode,
        };

        // Sponsor attach only first time
        if (!userData.sponsorId) {
          const pendingRef =
            localStorage.getItem("jbk_pending_ref") || "";

          if (pendingRef) {
            updatePayload.sponsorId = pendingRef;

            // Sponsor referral count update
            // Assumption:
            // sponsorId == sponsor referralCode

            // Referral code owner find
            // If later you store sponsor uid directly,
            // then this section can be optimized.

            // For now skip complex lookup
          }
        }

        await updateDoc(userRef, updatePayload);

        setReferralCode(finalReferralCode);

        localStorage.removeItem("jbk_pending_ref");
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    }

    activateMLM();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="font-bold">
          Activating MLM...
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] p-4">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl text-center">

        <div className="text-6xl mb-4">
          ✅
        </div>

        <h1 className="text-3xl font-black text-green-600">
          Payment Successful
        </h1>

        <p className="mt-3 text-gray-500">
          Your order has been placed successfully.
        </p>

        <div className="mt-6 rounded-2xl bg-green-50 p-4 border border-green-200">
          <p className="text-xs font-bold text-gray-500">
            YOUR REFERRAL CODE
          </p>

          <h2 className="mt-2 text-2xl font-black text-green-600">
            {referralCode}
          </h2>
        </div>

        <Link
          href="/"
          className="mt-6 block w-full rounded-2xl bg-indigo-600 p-4 text-center font-black text-white"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
