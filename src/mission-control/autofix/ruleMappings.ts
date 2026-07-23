export interface RuleMapping {
  name: string;
  pattern: RegExp;
  configPath: string;
  safe: boolean;
}

export const VERIFIED_RULES: RuleMapping[] = [
  {
    name: "MLM Level 1",
    pattern: /\blevel1\b/i,
    configPath: "mlm.level1",
    safe: true,
  },
  {
    name: "MLM Level 2",
    pattern: /\blevel2\b/i,
    configPath: "mlm.level2",
    safe: true,
  },
  {
    name: "MLM Level 3",
    pattern: /\blevel3\b/i,
    configPath: "mlm.level3",
    safe: true,
  },
  {
    name: "Cashback Percent",
    pattern: /\bcashback\b/i,
    configPath: "cashback.cashbackPercent",
    safe: true,
  },
  {
    name: "Watch Reward",
    pattern: /\brewardAmount\b/i,
    configPath: "watchEarn.rewardAmount",
    safe: true,
  },
  {
    name: "Required Videos",
    pattern: /\brequiredVideos\b/i,
    configPath: "watchEarn.requiredVideos",
    safe: true,
  },
  {
    name: "Referral Bonus",
    pattern: /\breferralBonus\b/i,
    configPath: "referral.referralBonus",
    safe: true,
  },
  {
    name: "Joining Bonus",
    pattern: /\bjoiningBonus\b/i,
    configPath: "signup.joiningBonus",
    safe: true,
  },
  {
    name: "Shipping Charge",
    pattern: /\bshippingCharge\b/i,
    configPath: "shipping.shippingCharge",
    safe: true,
  },
  {
    name: "Minimum Transfer",
    pattern: /\bminimumTransfer\b/i,
    configPath: "mlmPage.minimumTransfer",
    safe: true,
  },
];
