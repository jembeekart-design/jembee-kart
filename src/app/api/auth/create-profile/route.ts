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

    const decoded = await getAdminAuth().verifyIdToken(token, true);
    const uid = decoded.uid;

    const body = await req.json();
    const name =
      typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
    const sponsorCode =
      typeof body?.sponsorCode === "string" ? body.sponsorCode.trim() : "";

    if (name.length > 50) {
      return NextResponse.json(
        { success: false, error: "Name must be 50 characters or less" },
        { status: 400 }
      );
    }

    if (sponsorCode.length > 100) {
      return NextResponse.json(
        { success: false, error: "Invalid referral code" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);

    // Resolve the referral code on the server, never from client-supplied UIDs.
    let sponsorRef: FirebaseFirestore.DocumentReference | null = null;

    if (sponsorCode) {
      const matches = await db
        .collection("users")
        .where("shareCode", "==", sponsorCode)
        .limit(2)
        .get();

      if (matches.size > 1) {
        return NextResponse.json(
          { success: false, error: "Referral code is ambiguous" },
          { status: 409 }
        );
      }

      if (matches.empty || matches.docs[0].id === uid) {
        return NextResponse.json(
          { success: false, error: "Invalid referral code" },
          { status: 400 }
        );
      }

      if (matches.docs[0].data().isBlocked === true) {
        return NextResponse.json(
          { success: false, error: "This referral account is unavailable" },
          { status: 400 }
        );
      }

      sponsorRef = matches.docs[0].ref;
    }

    const result = await db.runTransaction(async (transaction) => {
      const existingUser = await transaction.get(userRef);

      if (existingUser.exists) {
        return { created: false };
      }

      let sponsorData: FirebaseFirestore.DocumentData | undefined;

      if (sponsorRef) {
        const sponsorSnap = await transaction.get(sponsorRef);
        if (sponsorSnap.exists && sponsorSnap.id !== uid) {
          const data = sponsorSnap.data()!;
          // Ensure the code still matches and sponsor remains available.
          if (data.shareCode === sponsorCode && data.isBlocked !== true) {
            sponsorData = data;
          }
        }

        if (!sponsorData) {
          throw new Error("INVALID_SPONSOR");
        }
      }

      const sponsorUid = sponsorData && sponsorRef ? sponsorRef.id : "";
      const sponsorParentChain = Array.isArray(sponsorData?.parentChain)
        ? sponsorData.parentChain.filter(
            (id: unknown): id is string =>
              typeof id === "string" && id.trim().length > 0 && id !== uid
          )
        : [];

      const currentParentChain = sponsorUid
        ? [...new Set([sponsorUid, ...sponsorParentChain])].slice(0, 10)
        : [];

      // Read all lineage documents before performing any writes.
      const uplineRefs = currentParentChain.map((id) =>
        db.collection("users").doc(id)
      );
      const uplineSnapshots = [];

      for (const ref of uplineRefs) {
        uplineSnapshots.push(await transaction.get(ref));
      }

      // Do not create a broken lineage if an ancestor document is missing.
      const missingUpline = uplineSnapshots.some((snap) => !snap.exists);
      if (missingUpline) {
        throw new Error("REFERRAL_TREE_INCONSISTENT");
      }

      const providerId =
        typeof decoded.firebase?.sign_in_provider === "string"
          ? decoded.firebase.sign_in_provider
          : "password";

      const marketingShareCode = `JBK${uid.slice(0, 8)}`.toUpperCase();

      // Check for an existing share code inside the transaction before writes.
      const codeMatches = await transaction.get(
        db.collection("users")
          .where("shareCode", "==", marketingShareCode)
          .limit(1)
      );

      if (codeMatches.docs.some((snap) => snap.id !== uid)) {
        throw new Error("SHARE_CODE_COLLISION");
      }

      const profileName =
        name || (typeof decoded.name === "string" ? decoded.name.trim() : "") ||
        "JembeeKart User";

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
        parentChain: currentParentChain,
        joinedPackage: false,
        packageAmount: 0,
        activationDate: null,
        activatedByOrderId: "",
        packageId: null,
        packageName: "",
        packageStatus: "inactive",
        walletBalance: 0,
        commissionWallet: 0,
        rewardWallet: 0,
        totalIncome: 0,
        todayIncome: 0,
        totalWithdraw: 0,
        pendingWithdrawal: 0,
        rewardCount: 0,
        directBusiness: 0,
        teamBusiness: 0,
        totalTeamBusiness: 0,
        lifetimeBusiness: 0,
        directActiveReferrals: 0,
        teamActiveReferrals: 0,
        totalProductsPurchased: 0,
        level1Count: 0,
        level2Count: 0,
        level3Count: 0,
        level4Count: 0,
        level5Count: 0,
        referralIncome: 0,
        levelIncome: 0,
        rankIncome: 0,
        totalOrders: 0,
        lastOrderAt: null,
        isActive: false,
        isBlocked: false,
        kycStatus: "pending",
        kycSubmittedAt: null,
        kycApprovedAt: null,
        mlmActive: false,
        notificationCount: 0,
        unreadNotifications: 0,
        sponsorId: sponsorUid,
        sponsorReferralCode: sponsorUid ? sponsorCode : "",
        shareCode: marketingShareCode,
        referralCode: marketingShareCode,
        referralLink: "",
        totalReferrals: 0,
        directReferrals: 0,
        teamSize: 0,
        rank: "Member",
        currentRankId: "member",
        rankAchievedAt: null,
        settings: {
          darkMode: false,
          notifications: true,
        },
        loginCount: 1,
        createdAt: FieldValue.serverTimestamp(),
        lastLogin: FieldValue.serverTimestamp(),
        lastSeenAt: FieldValue.serverTimestamp(),
      });

      if (sponsorUid && sponsorRef) {
        transaction.update(sponsorRef, {
          totalReferrals: FieldValue.increment(1),
          directReferrals: FieldValue.increment(1),
          level1Count: FieldValue.increment(1),
        });
      }

      for (const ref of uplineRefs) {
        transaction.update(ref, {
          teamSize: FieldValue.increment(1),
        });
      }

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

    if (message === "INVALID_SPONSOR") {
      return NextResponse.json(
        { success: false, error: "Referral account is no longer available" },
        { status: 400 }
      );
    }

    if (message === "REFERRAL_TREE_INCONSISTENT") {
      return NextResponse.json(
        { success: false, error: "Referral data needs support review" },
        { status: 409 }
      );
    }

    if (message === "SHARE_CODE_COLLISION") {
      return NextResponse.json(
        { success: false, error: "Share code collision; please retry signup" },
        { status: 409 }
      );
    }

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
