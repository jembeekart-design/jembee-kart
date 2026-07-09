"use client";

// Force Next.js to bypass static prerendering for this route to eliminate useSearchParams compilation flags
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User, // Strict User type implementation
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/firebase/config";

function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") || "";

  /* ======================================================
  STEP 1: ONLY PASSIVE CAPTURE (Safe Transfer to Signup Engine)
  ====================================================== */
  useEffect(() => {
    if (referralCode) {
      localStorage.setItem("jbk_pending_ref", referralCode);
    }
  }, [referralCode]);

  /* ======================================================
  VERIFY & TELEMETRY SYNC (STRICT EXISTING USERS ONLY)
  ====================================================== */
  async function verifyAndTelemetrySync(user: User) {
  const q = query(
    collection(db, "users"),
    where("uid", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return false;
  }

  await updateDoc(snapshot.docs[0].ref, {
    lastLogin: serverTimestamp(),
  });

  return true;
}
  

  /* ======================================================
  EMAIL AUTHENTICATION (SECURED WITH VERIFICATION INTERCEPTOR)
  ====================================================== */
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      // Email Normalization Engine (Trims spacing & enforces lowercase standard)
      const normalizedEmail = email.trim().toLowerCase();
      const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      
      // Strict Reload Checkpoint: Force server telemetry pull to capture dynamic verification states
      await result.user.reload();

      // Security Gate: Prevent unverified users from bypassing credentials screening
      if (!result.user.emailVerified) {
        console.warn("Access Intercepted: Email verification is required.");
        window.location.href = "/verify-email";
        return;
      }

      const isExistingUser = await verifyAndTelemetrySync(result.user);
      
      if (isExistingUser) {
        // Clear cached reference tracking payloads safely
        localStorage.removeItem("jbk_pending_ref");
        // ✅ Redirect updated back to Root path as per requirement
        window.location.href = "/"; 
      } else {
        alert("Account records not found in JembeeKart database. Please Signup first.");
        await auth.signOut();
      }
    } catch (error: any) {
      console.error("Email Login Error Pipeline Exception:", error);
      alert(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================
  GOOGLE AUTHENTICATION (OAUTH BYPASS PIPELINE)
  ====================================================== */
  async function handleGoogleLogin() {
    if (loading) return;

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        // 🔍 DEBUG LOGS ADDED HERE
        console.log("GOOGLE UID:", result.user.uid);
        console.log("GOOGLE EMAIL:", result.user.email);

        const isExistingUser = await verifyAndTelemetrySync(result.user);
        const userDoc = await getDoc(doc(db, "users", result.user.uid));

if (userDoc.exists()) {
  const role = userDoc.data().role;

  if (role === "admin" || role === "super_admin") {
    window.location.href = "/admin";
    return;
  }
}
        console.log("USER EXISTS IN FIRESTORE:", isExistingUser);
        
        if (isExistingUser) {
          localStorage.removeItem("jbk_pending_ref");
          // ✅ Redirect updated back to Root path as per requirement
          window.location.href = "/"; 
        } else {
          // Agar user Firestore me nahi mila, to ye alert chalega aur signup pe bhejega
          alert("No existing profile found. Redirecting to Signup page to apply your referral code.");
          window.location.href = referralCode ? `/signup?ref=${referralCode}` : "/signup";
        }
      }
    } catch (error: any) {
      console.error("Google Login Error Pipeline Exception:", error);
      alert(error.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-[var(--card-color)] rounded-[32px] shadow-2xl border border-[var(--border-color)] p-8 md:p-10 z-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-[var(--button-text-color)] text-3xl shadow-md mb-4">
          🛍️
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[var(--text-color)] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          JembeeKart
        </h1>
        <p className="text-sm font-medium text-[var(--muted-text-color)] mt-2">Welcome back! Login to continue.</p>
      </div>

      {/* INPUT FORM CONTAINER */}
      <form onSubmit={handleEmailLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-[var(--muted-text-color)] mb-2">Email Address</label>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-[var(--border-color)] text-sm font-semibold text-[var(--text-color)] rounded-2xl px-4 py-3.5 outline-none transition-all focus:border-indigo-500 bg-[var(--background-color)]/50 focus:bg-[var(--card-color)]"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-[var(--muted-text-color)] mb-2">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-[var(--border-color)] text-sm font-semibold text-[var(--text-color)] rounded-2xl px-4 py-3.5 outline-none transition-all focus:border-indigo-500 bg-[var(--background-color)]/50 focus:bg-[var(--card-color)]"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-[var(--button-text-color)] font-black text-sm p-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Verifying Account..." : "Sign In"}
        </button>
      </form>

      {/* DYNAMIC REGISTRATION ROUTE LINK */}
      <p className="text-center text-xs font-bold text-[var(--muted-text-color)] mt-5">
        Don't have an account?{" "}
        <Link 
          href={referralCode ? `/signup?ref=${referralCode}` : "/signup"} 
          className="text-indigo-600 hover:underline font-black"
        >
          Create an Account
        </Link>
      </p>

      {/* LINE DISTINCTION */}
      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-[var(--border-color)]"></div>
        <span className="flex-shrink mx-4 text-xs font-black uppercase tracking-widest text-[var(--muted-text-color)]">Or</span>
        <div className="flex-grow border-t border-[var(--border-color)]"></div>
      </div>

      {/* GOOGLE INTEGRATION ENTRY */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-[var(--card-color)] border-2 border-[var(--border-color)] hover:bg-[var(--background-color)] transition-all text-[var(--text-color)] font-bold p-4 rounded-2xl disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.256-3.133C18.344 1.104 15.528 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.854 11.57-11.77 0-.795-.085-1.4-.195-1.945H12.24z"/>
        </svg>
        Continue with Google
      </button>
    </div>
  );
}

// 2. Main Page Layout Wrapper with Strict Suspense Boundary
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">
      {/* BACKGROUND GRAPHICS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md bg-[var(--card-color)] rounded-[32px] p-10 shadow-xl text-center text-sm font-semibold text-[var(--muted-text-color)]">
          Loading Authorization Engine...
        </div>
      }>
        <LoginCard />
      </Suspense>
    </main>
  );
}
