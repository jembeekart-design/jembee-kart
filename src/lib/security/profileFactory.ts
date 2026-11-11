import { serverTimestamp } from "firebase/firestore";
import type { RegisterUserData } from "./types";

interface CreateInitialProfileStateParams {
  data: RegisterUserData;
  targetUid: string;
  rawEmail: string;
  cleanSignupSource: string;
}

/**
 * Initial JEMBEE PLAY user profile for the video, Shorts and learning platform.
 * Video earnings and reward balances remain separate platform features.
 */
export function createInitialProfileState({
  data,
  targetUid,
  rawEmail,
  cleanSignupSource,
}: CreateInitialProfileStateParams) {
  return {
    uid: targetUid,
    name: data.name?.trim() || data.displayName?.trim() || "JEMBEE PLAY User",
    email: rawEmail,
    photo: data.photoURL || "",
    mobileNumber: "",
    emailVerified: data.emailVerified || false,
    authProvider: data.providerId || "password",
    accountStatus: "active",
    isActive: false,
    isBlocked: false,
    kycStatus: "pending",
    signupSource: cleanSignupSource,
    walletBalance: 0,
    commissionWallet: 0,
    rewardWallet: 0,
    totalIncome: 0,
    todayIncome: 0,
    totalWithdraw: 0,
    pendingWithdrawal: 0,
    walletLocked: false,
    dailyRewardClaimed: false,
    lastRewardClaimAt: null,
    darkMode: false,
    notificationsEnabled: true,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  };
}
