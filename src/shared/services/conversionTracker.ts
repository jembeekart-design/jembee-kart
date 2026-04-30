// src/shared/services/conversionTracker.ts

type Conversion = {
  type: "purchase" | "signup" | "add_to_cart";
  value?: number;
  userId?: string;
  ts: number;
};

let conversions: Conversion[] = [];

// 🔹 Track conversion
export const trackConversion = (data: Omit<Conversion, "ts">) => {
  const entry: Conversion = {
    ...data,
    ts: Date.now(),
  };

  conversions.push(entry);
};

// 🔹 Stats
export const getConversionStats = () => {
  const purchases = conversions.filter((c) => c.type === "purchase");
  const revenue = purchases.reduce(
    (sum, c) => sum + (c.value || 0),
    0
  );

  return {
    totalConversions: conversions.length,
    purchases: purchases.length,
    revenue,
  };
};

// 🔹 Reset
export const clearConversions = () => {
  conversions = [];
};