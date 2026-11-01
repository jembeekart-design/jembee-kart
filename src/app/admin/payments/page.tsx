import { redirect } from "next/navigation";

/**
 * Legacy payment settings page contained local-only form state and an alert,
 * so it appeared to save Cashfree/COD/UPI/Wallet settings without persisting
 * anything. Route administrators to the authenticated, server-backed
 * Cashfree settings page instead. Cashfree remains disabled until the full
 * payment, webhook, refund, and reconciliation flow is implemented.
 */
export default function PaymentsPage() {
  redirect("/admin/cashfree");
}
