// src/lib/admin-config/types.ts

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;

  backgroundColor: string;
  cardColor: string;

  textColor: string;
  mutedTextColor: string;

  borderColor: string;
  cardBorderColor: string;

  buttonColor: string;
  buttonTextColor: string;

  headerBackground: string;
  searchBarColor: string;

  successColor: string;
  warningColor: string;
  dangerColor: string;
}

export interface PaymentConfig {
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  defaultPaymentMethod: string;
}

export interface ShippingConfig {
  freeShipping: boolean;
  shippingCharge: number;
  deliveryDays: number;
}

export interface WatchEarnConfig {
  enabled: boolean;

  requiredVideos: number;
  rewardAmount: number;
  requiredSales: number;
}

export interface CashbackConfig {
  enabled: boolean;
  cashbackPercent: number;
}

export interface MLMConfig {
  enabled: boolean;

  level1: number;
  level2: number;
  level3: number;

  maxLevels: number;
}
export interface ReferralConfig {
  enabled: boolean;

  referralBonus: number;
  maxReferralLevels: number;
}
export interface SignupConfig {
  enabled: boolean;

  joiningBonus: number;
  referralBonus: number;

  requireReferral: boolean;
}

export interface WalletConfig {
  commissionWalletEnabled: boolean;
  rewardWalletEnabled: boolean;
  cashbackWalletEnabled: boolean;
}

export interface SellerConfig {
  enabled: boolean;
  defaultSellerId: string;
  defaultSellerName: string;
}

export interface FeatureFlags {
  ecommerce: boolean;
  referral: boolean;
  watchEarn: boolean;
  cashback: boolean;
  mlm: boolean;
  creatorEconomy: boolean;
}

export interface AdminConfig {
  theme: ThemeConfig;

  payment: PaymentConfig;
  shipping: ShippingConfig;

  watchEarn: WatchEarnConfig;
  cashback: CashbackConfig;
  mlm: MLMConfig;

  signup: SignupConfig;

  wallet: WalletConfig;
  seller: SellerConfig;

  featureFlags: FeatureFlags;
}
