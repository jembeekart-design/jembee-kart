export const applyCoupon = (amount: number, code?: string) => {
  if (!code) return 0;

  if (code === "SAVE10") return amount * 0.1;
  if (code === "FLAT50") return 50;

  return 0;
};