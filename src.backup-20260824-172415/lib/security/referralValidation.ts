import {
  RegisterUserData,
  ReferralValidationResult,
} from "./types";

/**
 * ==========================================================
 * Referral Validation
 * Builds verified referral information.
 * ==========================================================
 */
export function buildReferralData(
  data: RegisterUserData
): ReferralValidationResult {

  const sponsorUid =
    data.sponsorUid?.trim() || "";

  const sponsorCode =
    data.sponsorCode?.trim() || "";

  const parentChain =
    data.sponsorParentChain || [];
  if (!sponsorUid) {
  return {
    success: true,
    sponsorUid: "",
    sponsorCode: "",
    parentChain: [],
    referralCode: "",
    shareCode: "",
  };
}
if (sponsorUid && sponsorUid === data.uid.trim()) {
  return {
    success: false,
    message: "Self referral is not allowed.",
    sponsorUid: "",
    sponsorCode: "",
    parentChain: [],
    referralCode: "",
    shareCode: "",
  };
}
  const firstPart =
    data.uid.slice(0, 6).toUpperCase();

  const lastPart =
    data.uid.slice(-4).toUpperCase();

  const referralCode =
    `JBK${firstPart}${lastPart}`;

  return {

    success: true,

    sponsorUid,

    sponsorCode,

    parentChain: sponsorUid
      ? [sponsorUid, ...parentChain].slice(0, 10)
      : [],

    referralCode,

    shareCode: referralCode,

  };

}
