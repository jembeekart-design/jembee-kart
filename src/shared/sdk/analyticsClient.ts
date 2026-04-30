// src/shared/sdk/analyticsClient.ts

type EventPayload = {
  name: string;
  props?: Record<string, any>;
};

class AnalyticsClient {
  private enabled = true;

  init(opts?: { enabled?: boolean }) {
    this.enabled = opts?.enabled ?? true;
  }

  // 🔹 Track event (can route to GA, Firebase, or your API)
  async track(event: EventPayload) {
    if (!this.enabled) return;

    try {
      // 1) local debug
      if (typeof window !== "undefined") {
        console.debug("[ANALYTICS]", event.name, event.props);
      }

      // 2) send to your backend (recommended)
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...event,
          ts: Date.now(),
        }),
      });
    } catch (e) {
      // fail-safe (never break UI)
      console.warn("Analytics error", e);
    }
  }

  // 🔹 Common events
  viewProduct(id: string) {
    return this.track({ name: "view_product", props: { id } });
  }

  addToCart(id: string, qty: number) {
    return this.track({ name: "add_to_cart", props: { id, qty } });
  }

  purchase(orderId: string, amount: number) {
    return this.track({ name: "purchase", props: { orderId, amount } });
  }
}

export const analyticsClient = new AnalyticsClient();