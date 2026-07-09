"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import { auth, db } from "@/firebase/config";

export default function PaymentSuccessPage() {
  const [loading, setLoading] = useState(true);

  const [userName, setUserName] = useState("");
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          const userRef = doc(
            db,
            "users",
            user.uid
          );

          const userSnap =
            await getDoc(userRef);

          if (!userSnap.exists()) {
            setLoading(false);
            return;
          }

          const userData =
            userSnap.data();

          setUserName(
            userData.name ||
              user.displayName ||
              "JembeeKart User"
          );

          let code =
            userData.referralCode || "";

          if (!code) {
            code =
              "JBK" +
              Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();

            await updateDoc(userRef, {
              mlmActive: true,
              referralCode: code,
            });
          } else {
            await updateDoc(userRef, {
              mlmActive: true,
            });
          }

          setReferralCode(code);
        } catch (error) {
          console.error(error);
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="font-bold text-lg">
          Activating MLM...
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] p-4">
      <div className="w-full max-w-md rounded-[32px] bg-[var(--card-color)] p-8 shadow-2xl text-center">

        <div className="text-6xl mb-4">
          ✅
        </div>

        <h1 className="text-4xl font-black text-[var(--success-color)]">
          Payment Successful
        </h1>

        <p className="mt-4 text-[var(--muted-text-color)]">
          Your order has been placed successfully.
        </p>

        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">

          <p className="text-xs font-bold text-[var(--muted-text-color)]">
            MEMBER NAME
          </p>

          <h2 className="mt-2 text-xl font-black text-[var(--text-color)]">
            {userName}
          </h2>

        </div>

        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">

          <p className="text-xs font-bold text-[var(--muted-text-color)]">
            YOUR REFERRAL CODE
          </p>

          <h2 className="mt-2 text-2xl font-black text-[var(--success-color)] break-all">
            {referralCode}
          </h2>

        </div>

        <Link
          href="/"
          className="mt-6 block w-full rounded-2xl bg-indigo-600 p-4 text-center font-black text-[var(--button-text-color)]"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
