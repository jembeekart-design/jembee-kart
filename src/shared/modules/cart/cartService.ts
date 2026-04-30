import { calculateFinalPrice } from "../product/pricingEngine";
import { applyCoupon } from "./couponEngine";
import { calculateShipping } from "./shippingCalculator";
import { calculateTax } from "./taxCalculator";

let cart: any[] = [];

// ➕ Add item
export const addToCart = (product: any, qty = 1) => {
  const existing = cart.find((c) => c.id === product.id);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }

  return cart;
};

// ➖ Remove
export const removeFromCart = (id: string) => {
  cart = cart.filter((c) => c.id !== id);
  return cart;
};

// 📦 Get cart
export const getCart = () => cart;

// 💰 Total calculation
export const getCartSummary = (margin = 30, coupon?: string) => {
  let subtotal = cart.reduce((sum, item) => {
    const price = calculateFinalPrice(item.basePrice, margin);
    return sum + price * item.qty;
  }, 0);

  const discount = applyCoupon(subtotal, coupon);
  const shipping = calculateShipping(subtotal);
  const tax = calculateTax(subtotal);

  const total = subtotal - discount + shipping + tax;

  return { subtotal, discount, shipping, tax, total };
};