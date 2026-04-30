// src/shared/services/analyticsService.ts

import { trackEvent } from "./eventTracker";
import { trackConversion } from "./conversionTracker";

class AnalyticsService {
  private enabled = true;

  init(opts?: { enabled?: boolean }) {
    this.enabled = opts?.enabled ?? true;
  }

  /* =========================================================
     🔹 GENERIC EVENT
  ========================================================= */

  track(name: string, props?: Record<string, any>) {
    if (!this.enabled) return;

    trackEvent({
      name,
      props,
    });
  }

  /* =========================================================
     🔹 COMMON EVENTS
  ========================================================= */

  viewProduct(productId: string) {
    this.track("view_product", { productId });
  }

  addToCart(productId: string, qty: number) {
    this.track("add_to_cart", { productId, qty });

    trackConversion({
      type: "add_to_cart",
      value: qty,
    });
  }

  purchase(orderId: string, amount: number) {
    this.track("purchase", { orderId, amount });

    trackConversion({
      type: "purchase",
      value: amount,
    });
  }

  signup(userId: string) {
    this.track("signup", { userId });

    trackConversion({
      type: "signup",
    });
  }
}

export const analyticsService = new AnalyticsService();