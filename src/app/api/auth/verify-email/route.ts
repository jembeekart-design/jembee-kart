import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authorization.slice(7).trim();
    const decoded = await getAdminAuth().verifyIdToken(token, true);

    if (decoded.email_verified !== true) {
      return NextResponse.json(
        { success: false, error: "Email address is not verified" },
        { status: 403 }
      );
    }

    const userRef = getAdminDb().collection("users").doc(decoded.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Account profile not found. Please contact support." },
        { status: 404 }
      );
    }

    await userRef.update({
      emailVerified: true,
      emailVerifiedAt: FieldValue.serverTimestamp(),
      lastLogin: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email verification profile sync failed:", error);
    return NextResponse.json(
      { success: false, error: "Could not synchronize verified account" },
      { status: 500 }
    );
  }
}
