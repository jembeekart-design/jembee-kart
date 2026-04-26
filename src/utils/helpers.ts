// src/utils/helpers.ts

// 💰 Final Price calculate
export const calculateFinalPrice = (price: number, margin: number) => {
  return price + margin;
};

// 💸 Discount calculate (%)
export const calculateDiscount = (original: number, final: number) => {
  if (original === 0) return 0;
  return Math.round(((original - final) / original) * 100);
};

// 🧾 Format Currency (₹)
export const formatPrice = (amount: number) => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

// 🔤 Slug generator (URL friendly)
export const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};

// 🧊 Glass style generator (dynamic theme)
export const getGlassStyle = (opacity = 0.08, blur = 12) => {
  return {
    background: `rgba(255,255,255,${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(255,255,255,0.2)`,
    borderRadius: "16px",
  };
};

// 📅 Format Date
export const formatDate = (date: any) => {
  try {
    return new Date(date).toLocaleDateString("en-IN");
  } catch {
    return "";
  }
};

// 🔢 Random ID (simple)
export const generateId = () => {
  return Math.random().toString(36).substring(2, 10);
};

// 📦 Safe number (NaN fix)
export const safeNumber = (value: any) => {
  return isNaN(Number(value)) ? 0 : Number(value);
};
