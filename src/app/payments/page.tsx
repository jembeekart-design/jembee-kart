import { redirect } from "next/navigation";

// Legacy payment route intentionally returns customers to the cart.
// All order creation and payment processing must go through the verified checkout APIs.
export default function LegacyPaymentsPage() {
  redirect("/cart");
}
