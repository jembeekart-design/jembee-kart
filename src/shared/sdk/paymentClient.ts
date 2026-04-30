// src/shared/sdk/paymentClient.ts

type CreatePaymentInput = {
  amount: number; // in paise if Razorpay
  currency?: string;
  receipt?: string;
  meta?: Record<string, any>;
};

type PaymentResult = {
  paymentId: string;
  status: "success" | "failed";
};

declare global {
  interface Window {
    Razorpay?: any;
  }
}

class PaymentClient {
  // 🔹 Load Razorpay script once
  private async loadScript() {
    if (typeof window === "undefined") return;
    if (window.Razorpay) return;

    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve();
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  // 🔹 Create order on your server (recommended)
  async createOrder(input: CreatePaymentInput) {
    // call your API which talks to Razorpay
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return res.json();
  }

  // 🔹 Open checkout
  async pay(options: {
    key: string;
    orderId: string;
    amount: number;
    name: string;
    description?: string;
    prefill?: { name?: string; email?: string; contact?: string };
    onSuccess: (res: any) => void;
    onFailure?: (err: any) => void;
  }): Promise<PaymentResult> {
    await this.loadScript();

    return new Promise((resolve) => {
      const rzp = new window.Razorpay({
        key: options.key,
        order_id: options.orderId,
        amount: options.amount,
        name: options.name,
        description: options.description,
        prefill: options.prefill,
        handler: (res: any) => {
          options.onSuccess(res);
          resolve({ paymentId: res.razorpay_payment_id, status: "success" });
        },
        modal: {
          ondismiss: () => {
            options.onFailure?.(new Error("Payment cancelled"));
            resolve({ paymentId: "", status: "failed" });
          },
        },
        theme: {
          // 🎨 Admin theme sync (glass primary color)
          color:
            getComputedStyle(document.documentElement)
              .getPropertyValue("--primary")
              .trim() || "#6366f1",
        },
      });

      rzp.open();
    });
  }
}

export const paymentClient = new PaymentClient();