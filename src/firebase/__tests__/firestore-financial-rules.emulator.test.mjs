import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const host = process.env.FIRESTORE_EMULATOR_HOST;
const enabled = typeof host === "string" && host.length > 0;
const projectId = process.env.GCLOUD_PROJECT || "demo-jembee-play";
const rulesText = fs.readFileSync(path.resolve(process.cwd(), "firestore.rules"), "utf8");

test("Firestore financial Rules Emulator suite", { skip: !enabled }, async (t) => {
  const { initializeTestEnvironment, assertFails, assertSucceeds } =
    await import("@firebase/rules-unit-testing");
  const { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } =
    await import("firebase/firestore");

  const env = await initializeTestEnvironment({
    projectId,
    firestore: { rules: rulesText, host: host.split(":")[0], port: Number(host.split(":")[1]) },
  });
  const uid = "phase34_user";
  const adminUid = "phase34_admin";
  const seeded = [
    ["watchVideoPaymentOrders", "order_1", { userId: uid, status: "paid", amountPaise: 10000 }],
    ["watchVideoPurchases", "video_1_user_1", { userId: uid, videoId: "video_1", status: "paid" }],
    ["watchVideoPaymentEvents", "event_1", { userId: uid, cfPaymentId: "cf_1" }],
    ["shortsSettlementLedger", "ledger_1", { orderId: "order_1", entryType: "creator_share", amountPaise: 7000, currency: "INR" }],
    ["shortsVerifiedExpenses", "expense_1", { orderId: "order_1", amountPaise: 100, status: "verified" }],
    ["teacherReferralAttributions", "teacher_1", { teacherUid: "teacher_1", referrerUid: "referrer_1", status: "verified" }],
    ["creatorAdEarnings", "earning_1", { creatorId: uid, creatorAmount: 1, status: "AVAILABLE" }],
  ];
  try {
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await Promise.all(seeded.map(([name, id, data]) => setDoc(doc(db, name, id), data)));
      await setDoc(doc(db, "users", uid), { role: "user", displayName: "Test User" });
      await setDoc(doc(db, "users", adminUid), { role: "admin" });
    });

    await t.test("regular user cannot read or enumerate any financial collection", async () => {
      const db = env.authenticatedContext(uid).firestore();
      for (const [name, id] of seeded) {
        await assertFails(getDoc(doc(db, name, id)), `${name} direct read should be denied`);
        await assertFails(getDocs(collection(db, name)), `${name} list should be denied`);
      }
    });

    await t.test("regular user cannot create, update or delete financial records", async () => {
      const db = env.authenticatedContext(uid).firestore();
      for (const [name, id, data] of seeded) {
        const ref = doc(db, name, id);
        await assertFails(setDoc(ref, data));
        await assertFails(updateDoc(ref, { status: "tampered" }));
        await assertFails(deleteDoc(ref));
      }
    });

    await t.test("admin client token does not grant direct financial collection access", async () => {
      const db = env.authenticatedContext(adminUid, { role: "admin" }).firestore();
      for (const [name, id, data] of seeded) {
        await assertFails(getDoc(doc(db, name, id)));
        await assertFails(setDoc(doc(db, name, `${id}_admin_write`), data));
      }
    });

    await t.test("owner profile access remains separate from financial collections", async () => {
      const db = env.authenticatedContext(uid).firestore();
      await assertSucceeds(getDoc(doc(db, "users", uid)));
      await assertFails(getDoc(doc(db, "users", adminUid)));
      await assertFails(getDoc(doc(db, "shortsSettlementLedger", "ledger_1")));
    });
  } finally {
    await env.cleanup();
  }
});

test("rules source explicitly denies client access to all inventoried financial collections", () => {
  for (const name of ["watchVideoPaymentOrders","watchVideoPurchases","watchVideoPaymentEvents",
    "shortsSettlementLedger","shortsVerifiedExpenses","teacherReferralAttributions","creatorAdEarnings"]) {
    const line = rulesText.split("\\n").find((candidate) => candidate.includes(`match /${name}/`));
    assert.ok(line, `missing explicit rule for ${name}`);
    assert.match(line, /allow read, write: if false;/);
  }
});

test("rules default deny unmatched documents", () => {
  assert.match(rulesText, /match \/\{document=\*\*\} \{\s*allow read, write: if false;/);
});
