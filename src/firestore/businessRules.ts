// src/firestore/businessRules.ts

import {
  doc,
  getDoc,
  Firestore,
} from "firebase/firestore";

import { db } from "./firebase";

// ======================================================
// TYPES
// ======================================================

export interface ProfitabilityRules {
  orderProfit: number;
  cashbackExpense: number;
  referralExpense: number;
  rewardExpense: number;
  creatorExpense: number;
  protectionFundExpense: number;
}

export interface ReferralRules {
  level1Commission: number;
  level2Commission: number;
  level3Commission: number;
  level4Commission: number;
}

export interface WatchEarnRules {
  videosRequired: number;
  rewardAmount: number;
  requiredSales: number;
}

export interface WalletRules {
  minimumWithdrawal: number;
  withdrawalCharge: number;
  kycRequired: boolean;
}

export interface CreatorEconomyRules {
  creatorRevenueShare: number;
  affiliateRevenueShare: number;
}

export interface BusinessRulesConfig {
  profitability: ProfitabilityRules;
  referral: ReferralRules;
  watchEarn: WatchEarnRules;
  wallet: WalletRules;
  creatorEconomy: CreatorEconomyRules;
}

// ======================================================
// SERVICE
// ======================================================

class BusinessRulesService {

  private readonly collection = "business_rules";

  async getProfitabilityRules(): Promise<ProfitabilityRules> {
    const snapshot = await getDoc(
      doc(db, this.collection, "profitability")
    );

    return snapshot.data() as ProfitabilityRules;
  }

  async getReferralRules(): Promise<ReferralRules> {
    const snapshot = await getDoc(
      doc(db, this.collection, "referral")
    );

    return snapshot.data() as ReferralRules;
  }

  async getWatchEarnRules(): Promise<WatchEarnRules> {
    const snapshot = await getDoc(
      doc(db, this.collection, "watchEarn")
    );

    return snapshot.data() as WatchEarnRules;
  }

  async getWalletRules(): Promise<WalletRules> {
    const snapshot = await getDoc(
      doc(db, this.collection, "wallet")
    );

    return snapshot.data() as WalletRules;
  }

  async getCreatorEconomyRules(): Promise<CreatorEconomyRules> {
    const snapshot = await getDoc(
      doc(db, this.collection, "creatorEconomy")
    );

    return snapshot.data() as CreatorEconomyRules;
  }

  async getAllRules(): Promise<BusinessRulesConfig> {
    const [
      profitability,
      referral,
      watchEarn,
      wallet,
      creatorEconomy,
    ] = await Promise.all([
      this.getProfitabilityRules(),
      this.getReferralRules(),
      this.getWatchEarnRules(),
      this.getWalletRules(),
      this.getCreatorEconomyRules(),
    ]);

    return {
      profitability,
      referral,
      watchEarn,
      wallet,
      creatorEconomy,
    };
  }
}

export const businessRules =
  new BusinessRulesService();
