export const validateOrder = (data: any) => {
  if (!data.items || !data.items.length) {
    throw new Error("Order must have items");
  }
  if (!data.userId) throw new Error("User required");
  return true;
};