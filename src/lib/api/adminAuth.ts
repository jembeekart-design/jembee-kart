import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export async function withAdminAuth(handler: Function, req?: Request) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const authHeader = req ? req.headers.get("authorization") : null;
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7).trim();
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const userSnapshot = await adminDb
      .collection("users")
      .where("uid", "==", decodedToken.uid)
      .get();
    const userDoc = userSnapshot.docs[0];
    
    if (!userDoc || (userDoc.data()?.role !== "admin" && userDoc.data()?.role !== "super_admin")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }
    return await (req ? handler(req) : handler());
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
