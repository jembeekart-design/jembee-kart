export const calculateFinalPrice = (base: number, margin: number) => {
  return Math.round(base + (base * margin) / 100);
};