"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function createUserProfile(
    user: any,
    displayName?: string
  ) {
    let sponsorId = "";

    const pendingRef =
      localStorage.getItem("jbk_pending_ref") || "";

    if (pendingRef) {
      try {
        const sponsorQuery = query(
          collection(db, "users"),
          where("referralCode", "==", pendingRef)
        );

        const sponsorSnap =
          await getDocs(sponsorQuery);

        if (!sponsorSnap.empty) {
          sponsorId = pendingRef;
        }
      } catch (error) {
        console.error(error);
      }
    }

    const referralCode =
      "JBK" +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,

        name:
          displayName ||
          user.displayName ||
          "JembeeKart User",

        email: user.email || "",

        photo: user.photoURL || "",

        walletBalance: 0,
        totalIncome: 0,

        mlmActive: false,

        sponsorId,
        referralCode,

        totalReferrals: 0,

        rank: "Member",

        createdAt: Date.now(),
        lastLogin: Date.now(),
      }
    );

    localStorage.removeItem(
      "jbk_pending_ref"
    );
  }

  async function handleEmailSignup(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      const result =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await createUserProfile(
        result.user,
        name
      );

      router.push("/account");
    } catch (error: any) {
      console.error(error);

      alert(
        error.message ||
          "Signup Failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    if (loading) return;

    try {
      setLoading(true);

      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result =
        await signInWithPopup(
          auth,
          provider
        );

      await createUserProfile(
        result.user
      );

      router.push("/account");
    } catch (error: any) {
      console.error(error);

      alert(
        error.message ||
          "Google Signup Failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] p-4">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-indigo-600">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Join JembeeKart Today
          </p>
        </div>

        <form
          onSubmit={handleEmailSignup}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
            className="w-full rounded-2xl border p-4 outline-none"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            className="w-full rounded-2xl border p-4 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            className="w-full rounded-2xl border p-4 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 p-4 font-black text-white"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-200" />

          <span className="px-4 text-xs font-bold text-gray-400">
            OR
          </span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full rounded-2xl border p-4 font-bold"
        >
          Continue With Google
        </button>
      </div>
    </main>
  );
}
