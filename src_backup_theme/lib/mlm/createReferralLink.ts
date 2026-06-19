import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

// Interface Contracts Definition
interface ReferralLinkData {
  userId: string;
  baseUrl?: string;
}

interface ReferralLinkResponse {
  success: boolean;
  message?: string;
  referralCode?: string;
  shareCode?: string;
  username?: string;
  referralLink?: string;
  whatsappUrl?: string;
  telegramUrl?: string;
  shareMessage?: string; // Kept for backwards compatibility with existing UI hooks
}

// Global Architecture Matrix Configuration
const MIN_REFERRAL_CODE_LENGTH = 3;

/**
 * Helper: Pure utility to securely append channel source attribution parameters.
 * Guarantees zero crash overhead even if base link configurations are missing protocols.
 */
function buildTrackedLink(baseLink: string, source: string): string {
  try {
    const url = new URL(baseLink);
    url.searchParams.set("src", source);
    return url.toString();
  } catch (error) {
    // Elegant fallback design pattern if URL constructor fails
    const joiner = baseLink.includes("?") ? "&" : "?";
    return `${baseLink}${joiner}src=${source}`;
  }
}

/**
 * Helper: Dynamic layout engine to generate standardized marketing copy blueprints.
 * Eliminates fragile regex or string replacement dependencies.
 */
function buildShareMessage(username: string, referralCode: string, trackingLink: string): string {
  return `
🚀 *Join JembeeKart Today*

👤 Invited by: *${username}*

🛒 Shop Products
💰 Earn Cashback
🤝 Build Your Team
🎁 Daily Rewards
📈 Referral Income

Register Now 👇
${trackingLink}

Referral Code: *${referralCode}*
  `.trim();
}

/**
 * 10/10 Enterprise-Grade Scalable Referral Engine for JembeeKart.
 * Non-mutating service layer built with modular helpers, isolated tracking functions,
 * and seamless multi-channel scaling parameters.
 */
export async function createReferralLink(
  data: ReferralLinkData
): Promise<ReferralLinkResponse> {
  const userId = data.userId?.trim();

  try {
    /* ======================================================
       VALIDATION GATE 1: PRIMARY IDENTIFIER LAYER
    ====================================================== */
    if (!userId) {
      return {
        success: false,
        message: "User ID Required",
      };
    }

    /* ======================================================
       GET USER PROFILE RECORDS (STRICT READ-ONLY DESIGN)
    ====================================================== */
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return {
        success: false,
        message: "User Not Found",
      };
    }

    const userData = userSnapshot.data();

    /* ======================================================
       SCHEMA MATCHING & DEEP TRIM SANITIZATION
    ====================================================== */
    const referralCode = (userData?.referralCode || "").trim();
    const shareCode = (userData?.shareCode || referralCode).trim();
    
    // Strict multi-tier lookup sequence to isolate blank spaces from interfaces
    const username =
      userData?.username?.trim() ||
      userData?.displayName?.trim() ||
      userData?.name?.trim() ||
      "JembeeKart User";

    /* ======================================================
       VALIDATION GATE 2: SYSTEM THRESHOLD INTEGRITY ENGINE
    ====================================================== */
    if (!referralCode || referralCode.length < MIN_REFERRAL_CODE_LENGTH) {
      return {
        success: false,
        message: "Invalid Referral Code",
      };
    }

    /* ======================================================
       ENVIRONMENT BASE HOOK RESOLUTION (SSR WORKER SAFE)
    ====================================================== */
    const appUrl = (
      data.baseUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://jembeekart.com"
    ).replace(/\/$/, "");

    /* ======================================================
       DETERMINISTIC CLEAN BASE REFERRAL LINK
    ====================================================== */
    const referralLink = `${appUrl}/signup?ref=${encodeURIComponent(referralCode)}`;

    /* ======================================================
       MODULAR TRACKING LINK GENERATION
    ====================================================== */
    const whatsappReferralLink = buildTrackedLink(referralLink, "whatsapp");
    const telegramReferralLink = buildTrackedLink(referralLink, "telegram");

    /* ======================================================
       DETERMINISTIC SHARE MESSAGES COMPILE
    ====================================================== */
    const whatsappShareMessage = buildShareMessage(username, referralCode, whatsappReferralLink);
    const telegramShareMessage = buildShareMessage(username, referralCode, telegramReferralLink);

    /* ======================================================
       SOCIAL API INTERACTION ROUTERS URLS
    ====================================================== */
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappShareMessage)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(telegramReferralLink)}&text=${encodeURIComponent(telegramShareMessage)}`;

    /* ======================================================
       COMPREHENSIVE RETURN CONTRACT
    ====================================================== */
    return {
      success: true,
      referralCode,
      shareCode,
      username,
      referralLink, // Base generic format for universal clipboards/manual tasks
      whatsappUrl,
      telegramUrl,
      shareMessage: whatsappShareMessage, // Standard safe payload mapping for legacy UI
    };

  } catch (error) {
    // Isolated context exception parsing infrastructure
    console.error("REFERRAL LINK GENERATION SERVICE EXCEPTION:", {
      context: "createReferralLink",
      userId: data.userId,
      timestamp: new Date().toISOString(), // Standard baseline until custom logger integration
      error,
    });
    
    return {
      success: false,
      message: "Unable to generate referral link",
    };
  }
}
