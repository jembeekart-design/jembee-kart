export const validateProduct = (data: any) => {
  if (!data.title) throw new Error("Title required");
  if (!data.basePrice) throw new Error("Price required");
  return true;
};