export const updateStock = (variant: any, qty: number) => {
  if (variant.stock < qty) throw new Error("Out of stock");
  return { ...variant, stock: variant.stock - qty };
};