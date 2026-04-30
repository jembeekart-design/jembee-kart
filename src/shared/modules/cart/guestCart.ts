const KEY = "guest_cart";

export const saveGuestCart = (cart: any[]) => {
  localStorage.setItem(KEY, JSON.stringify(cart));
};

export const getGuestCart = () => {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

export const clearGuestCart = () => {
  localStorage.removeItem(KEY);
};