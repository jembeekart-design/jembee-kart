import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

const DEFAULTS = {
  shippingConfigured: false,
  freeShipping: false,
  shippingCharge: 0,
  freeShippingThreshold: null as number | null,
  deliveryDays: 0,
};

async function verifyAdmin(req: Request): Promise<string> {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = header.slice(7).trim();
  if (!token || token.length > 8192) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(token, true);
  const db = getAdminDb();
  const direct = await db.collection("users").doc(decoded.uid).get();
  let role = direct.data()?.role;
  if (role !== "admin" && role !== "super_admin") {
    const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
    role = fallback.docs[0]?.data()?.role;
  }
  if (role !== "admin" && role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

function responseError(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
  if (status === 500) console.error("Admin shipping settings API failed", error);
  return NextResponse.json(
    { success: false, message: status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Shipping settings could not be processed" },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function validMoney(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) &&
    value >= 0 && value <= 100000 &&
    Math.abs(value * 100 - Math.round(value * 100)) <= 1e-7;
}

export async function GET(req: Request) {
  try {
    await verifyAdmin(req);
    const snap = await getAdminDb().collection("settings").doc("shipping").get();
    const data = snap.exists ? snap.data() || {} : {};
    const settings = {
      shippingConfigured: data.shippingConfigured === true,
      freeShipping: typeof data.freeShipping === "boolean" ? data.freeShipping : DEFAULTS.freeShipping,
      shippingCharge: validMoney(data.shippingCharge) ? data.shippingCharge : DEFAULTS.shippingCharge,
      freeShippingThreshold: data.freeShippingThreshold === null || data.freeShippingThreshold === undefined
        ? null : validMoney(data.freeShippingThreshold) ? data.freeShippingThreshold : null,
      deliveryDays: Number.isInteger(data.deliveryDays) && data.deliveryDays >= 0 && data.deliveryDays <= 90
        ? data.deliveryDays : DEFAULTS.deliveryDays,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
    };
    return NextResponse.json({ success: true, settings }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return responseError(error); }
}

export async function PUT(req: Request) {
  try {
    const uid = await verifyAdmin(req);
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 4096) {
      return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    }
    let body: unknown;
    try { body = JSON.parse(raw); } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, message: "Invalid settings payload" }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const allowed = new Set(["freeShipping", "shippingCharge", "freeShippingThreshold", "deliveryDays"]);
    if (Object.keys(input).length !== allowed.size || Object.keys(input).some((key) => !allowed.has(key))) {
      return NextResponse.json({ success: false, message: "All shipping fields are required; unknown fields are not allowed" }, { status: 400 });
    }
    if (typeof input.freeShipping !== "boolean" || !validMoney(input.shippingCharge)) {
      return NextResponse.json({ success: false, message: "Invalid free-shipping toggle or shipping charge" }, { status: 400 });
    }
    const threshold = input.freeShippingThreshold;
    if (threshold !== null && !validMoney(threshold)) {
      return NextResponse.json({ success: false, message: "Free-shipping threshold must be a non-negative INR amount with at most two decimals" }, { status: 400 });
    }
    if (!Number.isInteger(input.deliveryDays) || Number(input.deliveryDays) < 0 || Number(input.deliveryDays) > 90) {
      return NextResponse.json({ success: false, message: "Delivery days must be a whole number from 0 to 90" }, { status: 400 });
    }
    const settings = {
      shippingConfigured: true,
      freeShipping: input.freeShipping,
      shippingCharge: input.shippingCharge,
      freeShippingThreshold: threshold,
      deliveryDays: input.deliveryDays,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: uid,
    };
    await getAdminDb().collection("settings").doc("shipping").set(settings, { merge: true });
    return NextResponse.json({
      success: true,
      settings: { ...settings, updatedAt: new Date().toISOString() },
      message: "Shipping settings saved",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return responseError(error); }
}
