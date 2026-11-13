import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const enabled = typeof emulatorHost === "string" && emulatorHost.length > 0;
const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || "demo-jembee-play";
const suite = test("Firestore Emulator settlement transaction integration", { skip: !enabled }, async (t) => {
  const { initializeApp, deleteApp } = await import("firebase-admin/app");
  const { getFirestore, FieldValue } = await import("firebase-admin/firestore");
  const app = initializeApp({ projectId }, `settlement-emulator-${process.pid}`);
  const db = getFirestore(app);
  const prefix = `phase33_${process.pid}_${Date.now()}`;
  const collection = db.collection("_phase33_settlement_emulator_tests");
  const refs = [];
  const ref = (suffix) => {
    const doc = collection.doc(`${prefix}_${suffix}`);
    refs.push(doc);
    return doc;
  };
  try {
    await t.test("concurrent duplicate webhook retries create one set of ledger rows", async () => {
      const orderRef = ref("order");
      const creatorRef = ref("creator");
      const platformRef = ref("platform");
      await orderRef.set({ status: "paid", cfPaymentId: "cf_test_1", amountPaise: 10000 });
      const apply = () => db.runTransaction(async (tx) => {
        const [order, creator, platform] = await Promise.all([
          tx.get(orderRef), tx.get(creatorRef), tx.get(platformRef),
        ]);
        assert.equal(order.data()?.status, "paid");
        if (!creator.exists) tx.create(creatorRef, {
          orderId: orderRef.id, entryType: "creator_share", amountPaise: 7000,
          currency: "INR", createdAt: FieldValue.serverTimestamp(),
        });
        if (!platform.exists) tx.create(platformRef, {
          orderId: orderRef.id, entryType: "platform_share", amountPaise: 3000,
          currency: "INR", createdAt: FieldValue.serverTimestamp(),
        });
      });
      await Promise.all([apply(), apply(), apply(), apply()]);
      const [creator, platform] = await Promise.all([creatorRef.get(), platformRef.get()]);
      assert.equal(creator.exists, true);
      assert.equal(platform.exists, true);
      assert.equal(creator.data().amountPaise + platform.data().amountPaise, 10000);
    });

    await t.test("cumulative refund replay is idempotent and increments use distinct keys", async () => {
      const orderRef = ref("refund_order");
      await orderRef.set({ status: "paid", shortsRefundedPaise: 0 });
      const appendRefund = async (cumulative) => db.runTransaction(async (tx) => {
        const order = await tx.get(orderRef);
        const previous = order.data().shortsRefundedPaise;
        assert.ok(cumulative >= previous);
        if (cumulative === previous) return false;
        const reversalRef = collection.doc(`${prefix}_refund_${cumulative}`);
        const existing = await tx.get(reversalRef);
        if (!existing.exists) tx.create(reversalRef, {
          entryType: "creator_share_reversal", amountPaise: -(cumulative - previous),
          currency: "INR", cumulativeRefundPaise: cumulative,
        });
        tx.update(orderRef, { shortsRefundedPaise: cumulative });
        return true;
      });
      assert.equal(await appendRefund(1000), true);
      assert.equal(await appendRefund(1000), false);
      assert.equal(await appendRefund(2500), true);
      assert.equal((await collection.doc(`${prefix}_refund_1000`).get()).data().amountPaise, -1000);
      assert.equal((await collection.doc(`${prefix}_refund_2500`).get()).data().amountPaise, -1500);
      assert.equal((await orderRef.get()).data().shortsRefundedPaise, 2500);
    });

    await t.test("teacher commission adjustment is appended once while summary is updated", async () => {
      const summaryRef = ref("teacher_commission_summary");
      const adjustmentRef = ref("teacher_commission_adjustment");
      await summaryRef.set({ amountPaise: 200, status: "pending_settlement" });
      const reconcile = (nextAmount) => db.runTransaction(async (tx) => {
        const summary = await tx.get(summaryRef);
        const adjustment = await tx.get(adjustmentRef);
        const previous = summary.data().amountPaise;
        const delta = nextAmount - previous;
        if (delta !== 0 && !adjustment.exists) tx.create(adjustmentRef, {
          entryType: "teacher_referral_commission_adjustment", amountPaise: delta, currency: "INR",
        });
        tx.update(summaryRef, { amountPaise: nextAmount });
      });
      await reconcile(150);
      await reconcile(150);
      assert.equal((await adjustmentRef.get()).data().amountPaise, -50);
      assert.equal((await summaryRef.get()).data().amountPaise, 150);
    });

    await t.test("transaction enforces read-before-write and rolls back failed batches", async () => {
      const markerRef = ref("atomic_marker");
      const forbiddenRef = ref("atomic_second");
      await assert.rejects(() => db.runTransaction(async (tx) => {
        tx.create(markerRef, { value: 1 });
        await tx.get(forbiddenRef);
      }));
      assert.equal((await markerRef.get()).exists, false);
    });

    await t.test("concurrent counter transactions do not lose updates", async () => {
      const counterRef = ref("counter");
      await counterRef.set({ value: 0 });
      await Promise.all(Array.from({ length: 12 }, () => db.runTransaction(async (tx) => {
        const snap = await tx.get(counterRef);
        tx.update(counterRef, { value: snap.data().value + 1 });
      }, { maxAttempts: 10 })));
      assert.equal((await counterRef.get()).data().value, 12);
    });
  } finally {
    await Promise.all(refs.map((doc) => doc.delete().catch(() => undefined)));
    const snapshot = await collection.where("__name__", ">=", `${prefix}_`).where("__name__", "<=", `${prefix}_\uf8ff`).get().catch(() => null);
    if (snapshot) await Promise.all(snapshot.docs.map((doc) => doc.ref.delete().catch(() => undefined)));
    await deleteApp(app);
  }
});

test("Phase 33 emulator suite is explicitly opt-in and refuses non-emulator execution", () => {
  if (!enabled) assert.equal(emulatorHost, undefined);
  else assert.match(emulatorHost, /^[^:]+:\d+$/);
});
