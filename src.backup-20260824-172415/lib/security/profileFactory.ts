import { serverTimestamp } from "firebase/firestore";
import type { RegisterUserData } from "./types";

interface CreateInitialProfileStateParams {
  data: RegisterUserData;
  targetUid: string;
  rawEmail: string;
  cleanSponsorUid: string;
  cleanSponsorCode: string;
  cleanSignupSource: string;
  newUserParentChain: string[];
  unifiedMarketingCode: string;
}

export function createInitialProfileState({
  data,
  targetUid,
  rawEmail,
  cleanSponsorUid,
  cleanSponsorCode,
  cleanSignupSource,
  newUserParentChain,
  unifiedMarketingCode,
}: CreateInitialProfileStateParams) {
  return {
    uid: targetUid,
    name: data.name?.trim() || data.displayName?.trim() || "JembeeKart User",
    email: rawEmail,
    photo: data.photoURL || "",
    mobileNumber: "",

    emailVerified: data.emailVerified || false,
    authProvider: data.providerId || "password",
    accountStatus: "active",
    isActive: false,
    isBlocked: false,
    kycStatus: "pending",

    referralCode: unifiedMarketingCode,
    shareCode: unifiedMarketingCode,
    sponsorId: cleanSponsorUid || null,
    sponsorReferralCode: cleanSponsorCode,
    sponsorJoinedAt: cleanSponsorUid ? serverTimestamp() : null,

    signupSource: cleanSignupSource,

    walletBalance: 0,
    commissionWallet: 0,
    rewardWallet: 0,
    totalIncome: 0,
    todayIncome: 0,
    totalWithdraw: 0,
    pendingWithdrawal: 0,
    walletLocked: false,

    directBusiness: 0,
    teamBusiness: 0,
    totalTeamBusiness: 0,
    lifetimeBusiness: 0,

    parentChain: newUserParentChain,
    teamSize: 0,
    totalReferrals: 0,
    directReferrals: 0,
    directActiveReferrals: 0,
    teamActiveReferrals: 0,

    dailyRewardClaimed: false,
    lastRewardClaimAt: null,
    joinedPackage: false,
    packageAmount: 0,
    activationDate: null,
    activatedByOrderId: "",

    rank: "Member",
    currentRankId: "member",
    rankAchievedAt: null,

    darkMode: false,
    notificationsEnabled: true,

    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  };
}
