"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
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
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ======================================================
  DYNAMIC USER PROFILE INITIALIZATION
  ====================================================== */
  async function createUserProfile(user: User, displayName?: string) {
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
        where("shareCode", "==", sponsorCode)
      );

      const sponsorSnap = await getDocs(q);

      if (!sponsorSnap.empty) {
        const sponsorDoc = sponsorSnap.docs[0];
        sponsorUid = sponsorDoc.data().uid;
        sponsorDocRef = sponsorDoc.ref;
      }
    }

    /* ======================================================
    HIGH-ENTROPY TWO-END BALANCED SHARING ARCHITECTURE
    - referralCode: Full unique UID for internal database relational queries.
    - shareCode: Combo of First 6 + Last 4 of UID ensuring ultimate entropy & readability.
    ====================================================== */
    const internalReferralCode = user.uid;
    
    const firstPart = user.uid.slice(0, 6).toUpperCase();
    const lastPart = user.uid.slice(-4).toUpperCase();
    const marketingShareCode = `JBK${firstPart}${lastPart}`;

    // 4. Fully Production-Compliant Structural MLM Write
    await setDoc(userRef, {
      uid: user.uid,

      name: displayName || user.displayName || "JembeeKart User",
      email: user.email || "",
      photo: user.photoURL || "",
      mobileNumber: "", // Initialized empty for future profiling/OTP flows

      // WALLET & REVENUE COUNTERS
      walletBalance: 0,
      commissionWallet: 0, 
      rewardWallet: 0,     
      totalIncome: 0,
      todayIncome: 0,
      totalWithdraw: 0,
      pendingWithdrawal: 0, 

      // BUSINESS VOLUME ENGINE COUNTERS
      directBusiness: 0,
      teamBusiness: 0,
      totalTeamBusiness: 0, 
      lifetimeBusiness: 0,

      // ACTIVE REFERRAL STATUS TRACKERS
      directActiveReferrals: 0,
      teamActiveReferrals: 0,

      // GENERATION PIPELINE COUNTS
      level1Count: 0,
      level2Count: 0,
      level3Count: 0,
      level4Count: 0, 
      level5Count: 0, 

      // FUTURE MLM INCOME BREAKDOWN FIELDS
      referralIncome: 0,
      levelIncome: 0,
      rankIncome: 0,

      // SYSTEM, SECURITY, ORDER & CONTROL FLAGS
      totalOrders: 0,
      lastOrderAt: null, 
      isActive: false,   // Controlled activation via first transaction checkout
      isBlocked: false,  // Admin enforcement flag for account suspension
      kycStatus: "pending", // Compliance/Payout clearance verification state

      mlmActive: !!sponsorUid,

      sponsorId: sponsorUid,
      sponsorReferralCode: sponsorCode,

      // Two-tier code management system
      referralCode: internalReferralCode, 
      shareCode: marketingShareCode,

      totalReferrals: 0,

      rank: "Member",
      currentRankId: "member", 

      createdAt: serverTimestamp(), 
      lastLogin: serverTimestamp(), 
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
      
      router.push("/mlm/dashboard");
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
      
      router.push("/mlm/dashboard");
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
