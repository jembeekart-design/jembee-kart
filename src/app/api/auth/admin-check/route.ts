import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const token = authorization.slice(7).trim();
    const decoded = await getAdminAuth().verifyIdToken(token);
    const db = getAdminDb();

    let userData: Record<string, unknown> | undefined;

    const directDoc = await db.collection("users").doc(decoded.uid).get();

    if (directDoc.exists) {
      userData = directDoc.data();
    } else {
      const snapshot = await db
        .collection("users")
        .where("uid", "==", decoded.uid)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        userData = snapshot.docs[0].data();
      }
    }

    const role = userData?.role;
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
