"use client";

import { Button } from "@/shared/ui/Button";

export const CheckoutScreen = () => {
  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Checkout</h2>

      <Button onClick={() => alert("Payment Flow")}>
        Pay Now
      </Button>
    </div>
  );
};