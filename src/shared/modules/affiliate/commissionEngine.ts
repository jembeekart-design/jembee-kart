// src/shared/modules/affiliate/commissionEngine.ts

type CommissionRule = {
  type: "percentage" | "flat";
  value: number;
};

let defaultRule: CommissionRule = {
  type: "percentage",
  value: 10, // 10%
};

// 🔹 Admin control
export const setCommissionRule = (rule: CommissionRule) => {
  defaultRule = rule;
};

export const getCommissionRule = () => defaultRule;

// 🔹 Calculate commission
export const calculateCommission = (amount: number) => {
  if (defaultRule.type === "percentage") {
    return Math.round((amount * defaultRule.value) / 100);
  }

  return defaultRule.value;
};