"use client";

import { useState, useEffect, Suspense } from "react"; 
import { useRouter, useSearchParams } from "next/navigation"; 
import Link from "next/link";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  User,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

/* ======================================================
INTERNAL FORM COMPONENT (Safely isolates useSearchParams)
====================================================== */
function RegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams(); 

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ======================================================
  ✅ URL REFERRAL INTERACTION CAPTURE
  ====================================================== */
  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam?.trim()) {
      localStorage.setItem("jbk_pending_ref", refParam.trim());
      console.log(`🔗 Referral tracking synchronized inside client state: ${refParam}`);
    }
  }, [searchParams]);

  /* ======================================================
  SECURE SERVER-SIDE USER PROFILE INITIALIZATION
  ====================================================== */
  async function createUserProfile(user: User, displayName?: string) {
    const idToken = await user.getIdToken();

    const response = await fetch("/api/auth/create-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        name: displayName || user.displayName || "",
        sponsorCode: localStorage.getItem("jbk_pending_ref") || "",
      }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success !== true) {
      throw new Error(
        typeof result?.error === "string"
          ? result.error
          : "Profile creation failed"
      );
    }

    localStorage.removeItem("jbk_pending_ref");
  }

  /* ======================================================
  EMAIL SIGNUP OPERATION
  ====================================================== */
  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const trimmedName = name.trim();
    const cleanName = trimmedName.replace(/\s+/g, " ");

    if (cleanName.length < 3) {
      alert("Please enter valid name");
      return;
    }
    if (cleanName.length > 50) {
      alert("Name must be less than 50 characters");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (!acceptedTerms) {
      alert("Please accept Terms & Conditions");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    let createdAuthUser: User | null = null;

    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      createdAuthUser = result.user;

      await createUserProfile(result.user, cleanName);
      await sendEmailVerification(result.user);
      router.push("/verify-email");
    } catch (error: any) {
      console.error("Email Registration Sequence Fault:", error);
      // Keep the Auth account if profile creation or its response fails.
      // This avoids deleting an account when the server may have committed
      // the profile but the client did not receive the response.
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

    if (!acceptedTerms) {
      alert("Please accept Terms & Conditions before signing up with Google.");
      return;
    }

    let createdAuthUser: User | null = null;
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      createdAuthUser = result.user;

      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await createUserProfile(result.user);
      }
      router.push("/mlm/dashboard");
    } catch (error: any) {
      console.error("Google Registration Sequence Fault:", error);
      // Do not delete a Google Auth account when profile creation fails.
      // The account may already belong to an existing user.
      alert(error.message || "Google Signup Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-page-background)] px-4 py-12">
      <div className="w-full max-w-md rounded-[32px] bg-[var(--color-card-background)] p-8 shadow-sm border border-[var(--color-border)]">
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-black text-[var(--color-primary-button)]">Create Account</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Join JembeeKart Today</p>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-2xl border p-4 outline-none transition focus:border-[var(--color-primary-button)]"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl border p-4 outline-none transition focus:border-[var(--color-primary-button)]"
          />
          <input
            type="password"
            placeholder="Password (Min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-2xl border p-4 outline-none transition focus:border-[var(--color-primary-button)]"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-2xl border p-4 outline-none transition focus:border-[var(--color-primary-button)]"
          />
          
          <div className="flex items-start gap-3 py-2 px-1">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary-button)] focus:ring-[var(--color-primary-button)]"
            />
            <label htmlFor="terms" className="text-xs text-[var(--text-secondary)] select-none">
              I agree to the{" "}
              <Link href="/terms_conditions" className="text-[var(--color-primary-button)] font-bold hover:underline">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[var(--color-primary-button)] font-bold hover:underline">
                Privacy Policy
              </Link>{" "}
              of JembeeKart.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[var(--color-primary-button)] p-4 font-black text-[var(--button-text-color)] transition hover:bg-[var(--color-primary-button)] disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-[var(--color-card-background)]" />
          <span className="px-4 text-xs font-bold text-[var(--text-secondary)]">OR</span>
          <div className="h-px flex-1 bg-[var(--color-card-background)]" />
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full rounded-2xl border p-4 font-bold bg-[var(--color-card-background)] text-[var(--text-primary)] hover:bg-[var(--color-page-background)] transition disabled:opacity-50"
        >
          Continue With Google
        </button>
      </div>
    </main>
  );
}

/* ======================================================
MAIN EXPORT WITH SUSPENSE BOUNDARY (Fixes Vercel Prerender)
====================================================== */
export default function SignupPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-page-background)]">
          <p className="text-sm font-bold text-[var(--text-secondary)] animate-pulse">
            Loading JembeeKart Secure Node...
          </p>
        </div>
      }
    >
      <RegistrationForm />
    </Suspense>
  );
}
