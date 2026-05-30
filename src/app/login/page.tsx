"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // URL Query Parameters check karne ke liye hook (?ref=YOUR_CODE)
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") || "";

  /* ======================================================
  FIRESTORE SAVE HELPER (STRICT DYNAMIC REFERRAL VALIDATION)
  ====================================================== */
  async function saveUserToFirestore(user: any) {
    let sponsorId = "";

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const isNewUser = !userSnap.exists();

    // Verification logic sirf naye user registrations ke liye chalega
    if (isNewUser && referralCode) {
      try {
        // Firestore query check karegi ki kya ye referralCode kisi existing valid sponsor ka hai
        const sponsorQuery = query(
          collection(db, "users"),
          where("referralCode", "==", referralCode)
        );
        
        const sponsorSnap = await getDocs(sponsorQuery);

        // Agar database me matching code mila, tabhi sponsorId allocate hoga warna empty string rahega
        if (!sponsorSnap.empty) {
          sponsorId = referralCode;
        }
      } catch (error) {
        console.error("Error verifying referral code validation:", error);
      }
    }

    if (isNewUser) {
      // New user schema write operation
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "JembeeKart User",
        email: user.email || "",
        photo: user.photoURL || "",

        walletBalance: 0,
        totalIncome: 0,
        mlmActive: false,
        referralCode: "",
        sponsorId, // Verified valid referral string or empty string

        totalReferrals: 0,
        rank: "Member",

        createdAt: Date.now(),
        lastLogin: Date.now()
      });
    } else {
      // Existing profiles ke liye update snapshot run hoga bina nodes ko disturb kiye
      await setDoc(
        userRef,
        {
          name: user.displayName || "JembeeKart User",
          email: user.email || "",
          photo: user.photoURL || "",
          lastLogin: Date.now()
        },
        { merge: true }
      );
    }
  }

  /* ======================================================
  EMAIL LOGIN
  ====================================================== */
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveUserToFirestore(result.user);
      window.location.href = "/account"; 
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================
  GOOGLE LOGIN
  ====================================================== */
  async function handleGoogleLogin() {
    if (loading) return;

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        await saveUserToFirestore(result.user);
        window.location.href = "/account"; 
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-gray-100 p-8 md:p-10 z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white text-3xl shadow-md mb-4">
            🛍️
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            JembeeKart
          </h1>
          <p className="text-sm font-medium text-gray-400 mt-2">Welcome back! Login to continue.</p>
        </div>

        {/* INPUT FORM CONTAINER */}
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-100 text-sm font-semibold text-gray-900 rounded-2xl px-4 py-3.5 outline-none transition-all focus:border-indigo-500 bg-gray-50/50 focus:bg-white"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-gray-100 text-sm font-semibold text-gray-900 rounded-2xl px-4 py-3.5 outline-none transition-all focus:border-indigo-500 bg-gray-50/50 focus:bg-white"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm p-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Verifying Account..." : "Sign In"}
          </button>
        </form>

        {/* DIVIDER LAYOUT */}
        <div className="relative flex py-6 items-center">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-xs font-black uppercase tracking-widest text-gray-400">Or</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        {/* GOOGLE INTEGRATION ACTION */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:bg-gray-50 transition-all text-gray-700 font-bold p-4 rounded-2xl disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.256-3.133C18.344 1.104 15.528 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.854 11.57-11.77 0-.795-.085-1.4-.195-1.945H12.24z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </main>
  );
}
