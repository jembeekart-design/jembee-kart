// src/shared/integrations/qikink/qikinkPricing.ts

let marginPercent = 30; // admin configurable

export const setQikinkMargin = (m: number) => {
  marginPercent = m;
};

export const getQikinkMargin = () => marginPercent;

// 🔹 Apply pricing on Qikink base price
export const applyQikinkPricing = (basePrice: number) => {
  const final = basePrice + (basePrice * marginPercent) / 100;
  return Math.round(final);
};