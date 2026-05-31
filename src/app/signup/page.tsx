"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  User,
} from "firebase/auth";

import {
  doc,
  query,
  collection,
  where,
  limit,
  getDocs,
  getDoc,
  serverTimestamp,
  runTransaction,
  increment,
  DocumentReference,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ======================================================
  CORE USER PROFILE INITIALIZATION ENGINE (ACID TRANSACTION)
  ====================================================== */
  async function createUserProfile(user: User, displayName?: string) {
    const userRef = doc(db, "users", user.uid);

    // 1. Conditional Sponsor Lineage Processing (Requires Firestore single-field index on 'shareCode')
    const sponsorCode = localStorage.getItem("jbk_pending_ref") || "";
    let sponsorUid = "";
    let sponsorDocRef: DocumentReference | null = null;
    let sponsorParentChain: string[] = [];

    if (sponsorCode) {
      const q = query(
        collection(db, "users"),
        where("shareCode", "==", sponsorCode),
        limit(1)
      );
      const sponsorSnap = await getDocs(q);

      if (!sponsorSnap.empty) {
        const sponsorDoc = sponsorSnap.docs[0];
        let resolvedSponsorUid = sponsorDoc.data().uid;

        // Anti Self-Referral Validation Gate
        if (resolvedSponsorUid === user.uid) {
          console.warn("Self-referral attempt detected and blocked automatically.");
          sponsorUid = "";
          sponsorDocRef = null;
        } else {
          sponsorUid = resolvedSponsorUid;
          sponsorDocRef = sponsorDoc.ref;
          
          const chain = sponsorDoc.data().parentChain;
          sponsorParentChain = Array.isArray(chain) ? chain : [];
        }
      }
    }

    /* ======================================================
    STABLE HIGH-ENTROPY SHORT FORM SHARECODE DESIGN
    Formula: JBK + UID_PREFIX(8) [e.g. JBKABCDEF12]
    ====================================================== */
    const marketingShareCode = `JBK${user.uid.slice(0, 8)}`.toUpperCase();

    /* ======================================================
    LIGHTWEIGHT ACID TRANSACTION WRITE
    ====================================================== */
    try {
      await runTransaction(db, async (transaction) => {
        // Double-check profile node isolation safety using deterministic transaction.get()
        const userSnapshot = await transaction.get(userRef);
        if (userSnapshot.exists()) {
          console.log("Profile node already instantiated. Aborting transaction.");
          return;
        }

        // Materialized Lineage Array tightly capped at 10 levels for compliance
        const currentParentChain = sponsorUid 
          ? [sponsorUid, ...sponsorParentChain].slice(0, 10) 
          : [];

        // Write complete structured JembeeKart user layout
        transaction.set(userRef, {
          uid: user.uid,
          name: displayName || user.displayName || "JembeeKart User",
          email: (user.email || "").toLowerCase(),
          photo: user.photoURL || "",
          
          mobileNumber: "", 
          phoneVerified: false, 
          emailVerified: user.emailVerified || false, // Asynchronously reloaded and verified downstream on verify-email page route lifecycle
          authProvider: user.providerData?.[0]?.providerId || "password", 
          role: "user", 
          walletLocked: false,
          accountStatus: "active", 
          profileCompleted: false,
          schemaVersion: 1,           // 🟡 Added for future data structure migrations mapping
          lastPlatform: "web",        // 🟡 Added platform identifier tag for deep analytics tracking

          // Network Ancestry Lineage Array
          parentChain: currentParentChain,

          // Package Activation Placeholders
          joinedPackage: false,
          packageAmount: 0,
          activationDate: null,
          activatedByOrderId: "", 
          packageId: null,         
          packageName: "",        
          packageStatus: "inactive", 

          // FINANCIAL WALLET ENGINE
          walletBalance: 0,
          commissionWallet: 0, 
          rewardWallet: 0,     
          totalIncome: 0,
          todayIncome: 0,
          totalWithdraw: 0,
          pendingWithdrawal: 0,       

          // BUSINESS & REFERRAL STATUS ENGINE
          directBusiness: 0,
          teamBusiness: 0,
          totalTeamBusiness: 0, 
          lifetimeBusiness: 0,
          directActiveReferrals: 0,
          teamActiveReferrals: 0,

          // COMMERCE PIPELINE
          totalProductsPurchased: 0,

          // GENERATION PIPELINE COUNTS (Level 1 counts handled synchronously, higher levels delegated to execution routines)
          level1Count: 0,
          level2Count: 0,
          level3Count: 0,
          level4Count: 0, 
          level5Count: 0, 

          // MLM INCOME BREAKDOWN FIELDS
          referralIncome: 0,
          levelIncome: 0,
          rankIncome: 0,

          // SYSTEM, SECURITY, ORDER & NOTIFICATION COUNTERS
          totalOrders: 0,
          lastOrderAt: null, 
          isActive: false,      
          isBlocked: false,     
          kycStatus: "pending", 
          kycSubmittedAt: null, 
          kycApprovedAt: null,
          mlmActive: false, 
          notificationCount: 0,       
          unreadNotifications: 0,     

          sponsorId: sponsorUid,
          sponsorReferralCode: sponsorUid ? sponsorCode : "",
          shareCode: marketingShareCode,
          referralLink: "",           // 🟡 Dynamic parameter target bucket (populated asynchronously via cloud workers or lazy hook triggers)
          
          totalReferrals: 0,
          directReferrals: 0,
          teamSize: 0, 

          rank: "Member",
          currentRankId: "member", 
          rankAchievedAt: null,

          settings: {                 
            darkMode: false,
            notifications: true,
          },

          loginCount: 1, 
          createdAt: serverTimestamp(), 
          lastLogin: serverTimestamp(), 
          lastSeenAt: serverTimestamp(), 
        });

        // Atomic metrics increments on direct sponsor node (Level 1 tracking)
        if (sponsorDocRef) {
          transaction.update(sponsorDocRef, {
            totalReferrals: increment(1),
            directReferrals: increment(1),
            level1Count: increment(1),
          });
        }
      });

      console.log("Profile node committed successfully via transaction context.");
      localStorage.removeItem("jbk_pending_ref");
      
    } catch (transactionError: any) {
      console.error("Critical Firestore Transaction Failed:", transactionError);
      throw transactionError; 
    }
  }

  /* ======================================================
  AUTONOMOUS ROLLBACK CLEANUP CONTROL
  ====================================================== */
  async function handleOrphanRollback(authUser: User) {
    console.warn("Rollback Engine Active: Remediating orphan Auth state credentials.");
    try {
      await authUser.delete();
      console.log("Orphan user credentials successfully scrubbed from Auth cluster.");
    } catch (authDeleteError: any) {
      console.error("Auth token deletion blocked (requires-recent-login context execution fallback applied).");
      try {
        await signOut(auth);
        console.log("Fallback session isolated via signout routing parameters.");
      } catch (signOutError) {
        console.error("Critical tracking fallback error logged:", signOutError);
      }
    }
  }

  /* ======================================================
  EMAIL SIGNUP OPERATION
  ====================================================== */
  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    // Strict Client Validation Gates & Sanitization
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
      
      // 🔴 Fix 3: Inverted Sequence - Commit complete database node baseline structure profile execution state FIRST
      await createUserProfile(result.user, cleanName);

      // 🔴 Fix 3 (Cont...): Post-profile transactional safety write, fire tracking token dispatch engine safely
      await sendEmailVerification(result.user);
      console.log("Verification email dispatched to target destination securely.");

      router.push("/verify-email");
    } catch (error: any) {
      console.error("Email Registration Sequence Fault:", error);
      if (createdAuthUser) {
        await handleOrphanRollback(createdAuthUser);
      }
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
      if (createdAuthUser) {
        await handleOrphanRollback(createdAuthUser);
      }
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
            placeholder="Password (Min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-2xl border p-4 outline-none transition focus:border-indigo-500"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-2xl border p-4 outline-none transition focus:border-indigo-500"
          />

          <div className="flex items-start gap-3 py-2 px-1">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="terms" className="text-xs text-gray-500 select-none">
              I agree to the{" "}
              <Link href="/terms" className="text-indigo-600 font-bold hover:underline">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-indigo-600 font-bold hover:underline">
                Privacy Policy
              </Link>{" "}
              of JembeeKart.
            </label>
          </div>

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
