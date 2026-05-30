"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// REQUIRED UPDATED IMPOSTS INTEGRATION
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  increment,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ======================================================
  UPDATED ENGINE: PROFILE INITIALIZATION & TREE TREE SYNC
  ====================================================== */
  async function createUserProfile(user: any, displayName?: string) {
    const userRef = doc(db, "users", user.uid);

    // 1. Duplicate Protection Engine
    const existingUser = await getDoc(userRef);
    if (existingUser.exists()) {
      console.log("Profile already linked within Firestore nodes. Skipping overwrite.");
      return;
    }

    let sponsorId = "";
    const pendingRef = localStorage.getItem("jbk_pending_ref") || "";

    if (pendingRef) {
      try {
        const sponsorQuery = query(
          collection(db, "users"),
          where("referralCode", "==", pendingRef)
        );
        const sponsorSnap = await getDocs(sponsorQuery);

        if (!sponsorSnap.empty) {
          sponsorId = pendingRef;
        }
      } catch (error) {
        console.error("Sponsor detection runtime failure:", error);
      }
    }

    // 2. Unique Referral Code Generator Sequence
    let referralCode = "";
    while (true) {
      referralCode =
        "JBK" +
        Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

      const codeQuery = query(
        collection(db, "users"),
        where("referralCode", "==", referralCode)
      );
      const codeSnap = await getDocs(codeQuery);

      if (codeSnap.empty) {
        break; // Zero matches confirmed, break loop
      }
    }

    // 3. Document Base Allocation Write
    await setDoc(userRef, {
      uid: user.uid,
      name: displayName || user.displayName || "JembeeKart User",
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
    });

    // 4. Sponsor Referral Count Atomic Update
    if (sponsorId) {
      try {
        const sponsorQuery = query(
          collection(db, "users"),
          where("referralCode", "==", sponsorId)
        );
        const sponsorSnap = await getDocs(sponsorQuery);

        if (!sponsorSnap.empty) {
          await updateDoc(sponsorSnap.docs[0].ref, {
            totalReferrals: increment(1),
          });
        }
      } catch (error) {
        console.error("Failed to update parent network increment metric:", error);
      }
    }

    // Cache clean
    localStorage.removeItem("jbk_pending_ref");
  }

  /* ======================================================
  EMAIL SIGNUP OPERATION
  ====================================================== */
  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(result.user, name);
      router.push("/account");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Signup Failed");
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================
  GOOGLE SIGNUP OPERATION
  ====================================================== */
  async function handleGoogleSignup() {
    if (loading) return;

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
      router.push("/account");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Google Signup Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] p-4">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-indigo-600">Create Account</h1>
          <p className="mt-2 text-sm text-gray-500">Join JembeeKart Today</p>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-2xl border p-4 outline-none transition focus:border-indigo-500"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl border p-4 outline-none transition focus:border-indigo-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-2xl border p-4 outline-none transition focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 p-4 font-black text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="px-4 text-xs font-bold text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full rounded-2xl border p-4 font-bold bg-white text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          Continue With Google
        </button>
      </div>
    </main>
  );
}
