"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/firebase/config";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncedRef = useRef(false); // ✅ Strict Race-Condition Concurrency Lock

  useEffect(() => {
    // Structural Gate: Lock validation layer context on execution mount
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email || "");

      // 🛑 Robust Google Provider Bypass Gate (.some() iteration array loop)
      const isGoogleUser = user.providerData.some(
        (provider) => provider.providerId === "google.com"
      );

      if (isGoogleUser) {
        console.log("Google user verified via provider token. Bypassing activation layout.");
        router.push("/mlm/dashboard");
        return;
      }

      // If user session lands verified already (e.g. background session update)
      if (user.emailVerified) {
        handleSyncAndRedirect(user.uid);
        return;
      }

      // 🔄 Real-time Active Verification Sync Pipeline (Interval Engine)
      if (!intervalRef.current) {
        intervalRef.current = setInterval(async () => {
          try {
            await user.reload();
            if (user.emailVerified) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              await handleSyncAndRedirect(user.uid);
            }
          } catch (reloadErr) {
            console.error("Background auth reload cycle tracking error:", reloadErr);
          }
        }, 4000);
      }
    });

    return () => {
      unsubscribe();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [router]);

  /* ======================================================
  CORE FIRESTORE VERIFICATION STATE SYNCHRONIZATION ENGINE
  ====================================================== */
  async function handleSyncAndRedirect(uid: string) {
    // 🛑 Concurrency Interceptor Gate
    if (syncedRef.current) {
      console.log("Sync sequence already in progress or completed. Aborting duplicate run.");
      return;
    }
    syncedRef.current = true; // Set block state instantly before async task execution

    try {
      const userRef = doc(db, "users", uid);
      
      // ✅ Enhanced Verification Audit Update
      await updateDoc(userRef, {
        emailVerified: true,
        emailVerifiedAt: serverTimestamp(),
        accountStatus: "active",            
        lastLogin: serverTimestamp()         
      });

      console.log("Firestore emailVerified status successfully synchronized with Firebase Auth state.");
      router.push("/mlm/dashboard");
    } catch (syncError) {
      console.error("Critical State Mismatch Sync Error:", syncError);
      syncedRef.current = false; // Reset lock to allow retry if transaction fails
      alert("Error synchronizing profile records. Please refresh or try again.");
    }
  }

  /* ======================================================
  MANUAL RE-VALIDATION ROUTINE (TRIGGERED BY ACTION CLICK)
  ===================================================== */
  async function checkVerificationStatus() {
    if (checking || syncedRef.current) return;
    try {
      setChecking(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        router.push("/login");
        return;
      }

      await currentUser.reload();
      console.log("Firebase Auth configuration parameters re-queried successfully.");

      if (currentUser.emailVerified) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        await handleSyncAndRedirect(currentUser.uid);
      } else {
        alert("Email verification pending. Please verify via the link inside your inbox.");
      }
    } catch (reloadError: any) {
      console.error("Auth status sync invocation faulted:", reloadError);
      alert(reloadError.message || "Status check failed.");
    } finally {
      setChecking(false);
    }
  }

  /* ======================================================
  DISPATCH RE-TRANSMISSION SEQUENCE
  ====================================================== */
  async function handleResendEmail() {
    if (resendLoading) return;
    try {
      setResendLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.push("/login");
        return;
      }
      
      const { sendEmailVerification } = await import("firebase/auth");
      await sendEmailVerification(currentUser);
      alert("A fresh verification mail sequence has been dispatched to your email address.");
    } catch (resendError: any) {
      console.error("Token transmission engine sequence exception:", resendError);
      alert(resendError.message || "Failed to resend token verification packet.");
    } finally {
      setResendLoading(false);
    }
  }

  /* ======================================================
  SAFE LOGOUT CLEANUP PIPELINE
  ====================================================== */
  async function handleSafeLogout() {
    try {
      if (intervalRef.current) clearInterval(intervalRef.current);
      await signOut(auth);
      router.push("/login");
    } catch (logoutError) {
      console.error("Session terminate fault tracking sequence triggered:", logoutError);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] p-4">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl text-center">
        <div className="mb-6">
          <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-800">Verify Your Email</h1>
          <p className="mt-2 text-sm text-gray-500">
            We have dispatched an activation token framework structure onto <br />
            <span className="font-bold text-indigo-600">{userEmail || "your inbox"}</span>
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={checkVerificationStatus}
            disabled={checking || syncedRef.current}
            className="w-full rounded-2xl bg-indigo-600 p-4 font-black text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {checking || syncedRef.current ? "Checking System Records..." : "I Have Verified"}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={resendLoading || checking || syncedRef.current}
            className="w-full rounded-2xl border border-gray-200 p-4 font-bold bg-white text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 text-sm"
          >
            {resendLoading ? "Transmitting Packet..." : "Resend Verification Email"}
          </button>
        </div>

        <button
          onClick={handleSafeLogout}
          className="mt-6 text-xs text-gray-400 font-bold hover:text-indigo-600 transition underline"
        >
          Back to Login Interface
        </button>
      </div>
    </main>
  );
}
