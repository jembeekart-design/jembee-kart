"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");

    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

  async function handleGoogleJoin() {
    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(
        auth,
        provider
      );

      const user = result.user;

      let sponsorId = "";

      if (referralCode) {
        const q = query(
          collection(db, "users"),
          where(
            "referralCode",
            "==",
            referralCode
          )
        );

        const sponsorSnap =
          await getDocs(q);

        if (!sponsorSnap.empty) {
          sponsorId =
            sponsorSnap.docs[0].id;
        }
      }

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {
          uid: user.uid,
          name:
            user.displayName ||
            "JembeeKart User",

          email: user.email || "",

          photo:
            user.photoURL || "",

          walletBalance: 0,
          totalIncome: 0,

          mlmActive: false,

          referralCode: "",

          sponsorId,

          totalReferrals: 0,

          rank: "Member",

          createdAt: Date.now()
        },
        { merge: true }
      );

      if (sponsorId) {
        await setDoc(
          doc(
            collection(
              db,
              "affiliates"
            )
          ),
          {
            userId: user.uid,
            sponsorId,
            joinedAt: Date.now()
          }
        );
      }

      router.push("/account");
    } catch (error) {
      console.error(error);
      alert("Registration Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-5">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl">

        <h1 className="text-3xl font-black">
          Join JembeeKart
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Register with referral
        </p>

        {referralCode && (
          <div className="mt-5 rounded-2xl bg-green-100 p-4">
            <p className="text-sm font-bold">
              Referral Code
            </p>

            <p className="mt-1 text-lg font-black text-green-700">
              {referralCode}
            </p>
          </div>
        )}

        <button
          onClick={handleGoogleJoin}
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-violet-700 py-4 font-black text-white"
        >
          {loading
            ? "Creating Account..."
            : "Continue With Google"}
        </button>
      </div>
    </main>
  );
}
