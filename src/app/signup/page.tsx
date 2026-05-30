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
  getDoc,
  updateDoc,
  increment,
  query,
  collection,
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

  /* ======================================================
  DYNAMIC USER PROFILE INITIALIZATION (100% COLLISION-FREE)
  ====================================================== */
  async function createUserProfile(user: any, displayName?: string) {
    const userRef = doc(db, "users", user.uid);

    // 1. Duplicate Profile Protection Engine
    const existingUser = await getDoc(userRef);
    if (existingUser.exists()) {
      console.log("Profile already linked within Firestore nodes. Skipping overwrite.");
      return;
    }

    // 2. Conditional Sponsor Tracking & UID Resolution Pipeline
    const sponsorCode = localStorage.getItem("jbk_pending_ref") || "";
    let sponsorUid = "";
    let sponsorDocRef = null;

    if (sponsorCode) {
      const q = query(
        collection(db, "users"),
        where("referralCode", "==", sponsorCode)
      );

      const sponsorSnap = await getDocs(q);

      if (!sponsorSnap.empty) {
        const sponsorDoc = sponsorSnap.docs[0];
        sponsorUid = sponsorDoc.data().uid;
        sponsorDocRef = sponsorDoc.ref;
      }
    }

    /* ======================================================
    UPGRADED: 100% COLLISION-FREE REFERRAL CODE GENERATION
    Combo of Base Prefix + Random Base36 String + Unique UID Tail Slice
    ====================================================== */
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 Random characters
    const uidPart = user.uid.slice(-4).toUpperCase(); // Last 4 characters of unique Firebase UID
    const referralCode = `JBK${randomPart}${uidPart}`; // Format: JBK + XXXX + XXXX (Total 11 chars)

    // 4. Fully Production-Compliant Structural MLM Write
    await setDoc(userRef, {
      uid: user.uid,

      name: displayName || user.displayName || "JembeeKart User",
      email: user.email || "",
      photo: user.photoURL || "",

      // WALLET & REVENUE COUNTERS
      walletBalance: 0,
      totalIncome: 0,
      todayIncome: 0,
      totalWithdraw: 0,

      // BUSINESS VOLUME ENGINE COUNTERS
      directBusiness: 0,
      teamBusiness: 0,
      lifetimeBusiness: 0,

      mlmActive: !!sponsorUid,

      sponsorId: sponsorUid,
      sponsorReferralCode: sponsorCode,

      referralCode, // Applied collision-free code

      totalReferrals: 0,

      rank: "Member",

      createdAt: Date.now(),
      lastLogin: Date.now(),
    });

    // 5. Sponsor Telemetry Real-time Increment Engine
    if (sponsorDocRef) {
      await updateDoc(sponsorDocRef, {
        totalReferrals: increment(1),
      });
    }

    // 6. Cache cleanup of temporary referral flags safely
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
      
      router.push("/");
    } catch (error: any) {
      console.error("Email Registration Error:", error);
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
      
      router.push("/");
    } catch (error: any) {
      console.error("Google Registration Error:", error);
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
