/**
 * Local safety regression checks for legacy MLM payout helpers.
 *
 * These checks intentionally do not connect to Firestore: client-side wallet
 * writes are denied by firestore.rules and the legacy passive-income payout
 * helper is disabled until a trusted server scheduler is specified.
 */
import { createDailyPassiveIncome } from "@/lib/mlm/orders/createDailyPassiveIncome";

async function runTest() {
  const result = await createDailyPassiveIncome({
    userId: "regression-test-user",
    amount: 100,
  });

  if (result.success !== false) {
    throw new Error("Legacy client passive-income payout must remain disabled.");
  }
  if (!result.message.toLowerCase().includes("disabled")) {
    throw new Error("Disabled payout must return an explicit explanation.");
  }

  console.log("PASS: legacy client passive-income payout is disabled.");
  console.log("NOTE: wallet credit concurrency tests require authenticated server integration tests and Firestore Emulator rules.");
}

runTest().catch((error) => {
  console.error("TEST FAILED:", error);
  process.exitCode = 1;
});
