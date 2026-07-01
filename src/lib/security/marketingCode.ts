/**
 * Generates a unified marketing/referral code.
 */
export function generateMarketingCode(uid: string): string {
  const firstPart = uid.slice(0, 6).toUpperCase();
  const lastPart = uid.slice(-4).toUpperCase();

  return `JBK${firstPart}${lastPart}`;
}
