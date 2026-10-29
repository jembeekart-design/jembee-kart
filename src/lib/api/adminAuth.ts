import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export async function withAdminAuth(handler: Function, req?: Request) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const authHeader = req ? req.headers.get("authorization") : null;
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token, true);
    } catch {
      return NextResponse.json({ success: false, message: "Session is invalid or expired" }, { status: 401 });
    }

    const userSnapshot = await adminDb
      .collection("users")
      .where("uid", "==", decodedToken.uid)
      .limit(2)
      .get();
    if (userSnapshot.size !== 1) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }
    const role = userSnapshot.docs[0].data()?.role;
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }
    return await (req ? handler(req) : handler());
  } catch (error) {
    console.error("Admin authorization service error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ success: false, message: "Unable to verify admin access" }, { status: 500 });
  }
}
