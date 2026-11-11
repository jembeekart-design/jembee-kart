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
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing authentication token" },
        { status: 401 }
      );
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > 4096) {
      return NextResponse.json(
        { success: false, error: "Request body is too large" },
        { status: 413 }
      );
    }

    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > 4096) {
      return NextResponse.json(
        { success: false, error: "Request body is too large" },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const decoded = await getAdminAuth().verifyIdToken(token, true);
    const uid = decoded.uid;
    const payload = body as Record<string, unknown>;
    const name =
      typeof payload.name === "string" ? payload.name.trim().replace(/\s+/g, " ") : "";
    if (payload.name !== undefined && typeof payload.name !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid profile fields" },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { success: false, error: "Name must be 50 characters or less" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);

    const result = await db.runTransaction(async (transaction) => {
      const existingUser = await transaction.get(userRef);

      if (existingUser.exists) {
        return { created: false };
      }

      const providerId =
        typeof decoded.firebase?.sign_in_provider === "string"
          ? decoded.firebase.sign_in_provider
          : "password";

      const profileName =
        name || (typeof decoded.name === "string" ? decoded.name.trim() : "") ||
        "JEMBEE PLAY User";

      transaction.set(userRef, {
        uid,
        name: profileName,
        email: (decoded.email || "").toLowerCase(),
        photo: decoded.picture || "",
        mobileNumber: "",
        phoneVerified: false,
        emailVerified: decoded.email_verified === true,
        authProvider: providerId,
        role: "user",
        walletLocked: false,
        accountStatus: "active",
        profileCompleted: false,
        schemaVersion: 1,
        lastPlatform: "web",
        walletBalance: 0,
        commissionWallet: 0,
        rewardWallet: 0,
        totalIncome: 0,
        todayIncome: 0,
        totalWithdraw: 0,
        pendingWithdrawal: 0,
        rewardCount: 0,
        isActive: false,
        isBlocked: false,
        kycStatus: "pending",
        kycSubmittedAt: null,
        kycApprovedAt: null,
        notificationCount: 0,
        unreadNotifications: 0,
        settings: {
          darkMode: false,
          notifications: true,
        },
        loginCount: 1,
        createdAt: FieldValue.serverTimestamp(),
        lastLogin: FieldValue.serverTimestamp(),
        lastSeenAt: FieldValue.serverTimestamp(),
      });

      return { created: true };
    });

    return NextResponse.json({
      success: true,
      created: result.created,
    });
  } catch (error) {
    console.error("Create profile API failed:", error);

    const message =
      error instanceof Error ? error.message : "Profile creation failed";

    if (
      message.includes("Firebase ID token") ||
      message.includes("Decoding Firebase ID token")
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Profile creation failed" },
      { status: 500 }
    );
  }
}
