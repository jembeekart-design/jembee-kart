import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export type AdminIdentity = { uid: string; role: "admin" | "super_admin" };

export async function requireAdmin(req: Request): Promise<AdminIdentity | NextResponse> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }
  const token = header.slice(7).trim();
  if (!token || token.length > 8192) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }
  try {
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    const db = getAdminDb();
    const direct = await db.collection("users").doc(decoded.uid).get();
    let role = direct.exists ? direct.data()?.role : undefined;
    if (role !== "admin" && role !== "super_admin") {
      const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
      role = fallback.docs[0]?.data()?.role;
    }
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }
    return { uid: decoded.uid, role };
  } catch {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }
}

export function isAdminIdentity(value: AdminIdentity | NextResponse): value is AdminIdentity {
  return !(value instanceof NextResponse);
}
