export const calculatePrice = (base: number, marginPercent: number) => {
  return Math.round(base + (base * marginPercent) / 100);
};