export const calculateShipping = (amount: number) => {
  if (amount > 999) return 0;
  return 50;
};