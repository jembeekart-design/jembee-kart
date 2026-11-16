import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const token = authorization.slice(7).trim();
    if (!token || token.length > 8192) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Match the shared requireAdmin() policy: reject revoked sessions and
    // resolve admin records stored either at users/{uid} or by uid field.
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    const users = getAdminDb().collection("users");
    const directDoc = await users.doc(decoded.uid).get();

    let role = directDoc.exists ? directDoc.data()?.role : undefined;

    // A non-admin profile at users/{uid} must not mask a separate legacy
    // admin profile whose document ID differs but whose uid matches.
    if (role !== "admin" && role !== "super_admin") {
      const fallback = await users
        .where("uid", "==", decoded.uid)
        .limit(1)
        .get();
      role = fallback.docs[0]?.data()?.role;
    }

    const isAdmin = role === "admin" || role === "super_admin";
    if (!isAdmin) {
      return NextResponse.json({ isAdmin: false }, { status: 403 });
    }

    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    console.error("Admin check failed:", error);
    return NextResponse.json(
      { isAdmin: false, message: "Admin verification failed" },
      { status: 500 }
    );
  }
}
