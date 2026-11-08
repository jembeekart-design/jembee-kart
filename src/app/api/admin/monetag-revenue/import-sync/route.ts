import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const adminUid = await verifyMonetagAdmin(req);
    const body = await req.json();
    const syncId = String(body.syncId || "").trim();

    if (!syncId || syncId.length > 200) {
      return NextResponse.json(
        { success: false, message: "मान्य API Sync रिकॉर्ड चुनें।" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const syncRef = db.collection("monetagApiSyncs").doc(syncId);
    const syncSnap = await syncRef.get();

    if (!syncSnap.exists) {
      return NextResponse.json(
        { success: false, message: "API Sync रिकॉर्ड नहीं मिला।" },
        { status: 404 }
      );
    }

    const sync = syncSnap.data()!;
    const grossRevenueUsd = Number(sync.totals?.money);
    const dateFrom = String(sync.dateFrom || "");
    const dateTo = String(sync.dateTo || "");

    if (
      sync.provider !== "monetag" ||
      !Number.isFinite(grossRevenueUsd) ||
      grossRevenueUsd <= 0 ||
      !dateFrom ||
      !dateTo
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "इस Sync में मान्य अवधि या सकारात्मक कमाई उपलब्ध नहीं है।",
        },
        { status: 422 }
      );
    }

    const settingsSnap = await db
      .collection("payment_settings")
      .doc("monetagRevenueShare")
      .get();

    const settings = settingsSnap.data() || {};
    const uploaderPercent = Number(settings.uploaderPercent ?? 30);
    const sharerPercent = Number(settings.sharerPercent ?? 20);

    if (
      !Number.isFinite(uploaderPercent) ||
      !Number.isFinite(sharerPercent) ||
      uploaderPercent < 0 ||
      sharerPercent < 0 ||
      uploaderPercent + sharerPercent > 100
    ) {
      return NextResponse.json(
        { success: false, message: "कमाई के प्रतिशत की सेटिंग सही नहीं है।" },
        { status: 409 }
      );
    }

    const externalRecordId = `monetag-api-sync:${syncId}`;
    const key = createHash("sha256")
      .update(externalRecordId)
      .digest("hex");
    const revenueRef = db.collection("monetagRevenueImports").doc(key);

    const uploaderPool = grossRevenueUsd * uploaderPercent / 100;
    const sharerPool = grossRevenueUsd * sharerPercent / 100;
    const platformRetainedUsd = Number(
      (grossRevenueUsd - uploaderPool - sharerPool).toFixed(6)
    );
    const unallocatedRevenueUsd = Number(
      (uploaderPool + sharerPool).toFixed(6)
    );

    const result = await db.runTransaction(async (tx) => {
      const existing = await tx.get(revenueRef);

      if (existing.exists) {
        return { duplicate: true };
      }

      tx.create(revenueRef, {
        externalRecordId,
        period: `${dateFrom} to ${dateTo}`,
        grossRevenueUsd,
        uploaderUserId: null,
        sharerUserId: null,
        uploaderPercent,
        sharerPercent,
        uploaderShareUsd: 0,
        sharerShareUsd: 0,
        platformRetainedUsd,
        unallocatedRevenueUsd,
        currency: "USD",
        status: "unallocated",
        attributionStatus: "aggregate_only_unallocated",
        source: "monetag_api_sync",
        sourceSyncId: syncId,
        importedBy: adminUid,
        createdAt: FieldValue.serverTimestamp(),
      });

      return { duplicate: false };
    });

    if (result.duplicate) {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          message: "यह API Sync रिपोर्ट पहले ही दर्ज है।",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Monetag API रिपोर्ट दर्ज हुई। Uploader और Sharer का हिस्सा अभी Unallocated है।",
      result: {
        grossRevenueUsd,
        uploaderShareUsd: 0,
        sharerShareUsd: 0,
        platformRetainedUsd,
        unallocatedRevenueUsd,
      },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status =
      code === "UNAUTHORIZED" ? 401 :
      code === "FORBIDDEN" ? 403 : 500;

    return NextResponse.json(
      {
        success: false,
        message:
          status === 401 ? "कृपया Admin में लॉगिन करें।" :
          status === 403 ? "केवल अधिकृत Admin यह कार्य कर सकता है।" :
          "API Sync रिपोर्ट दर्ज नहीं हो सकी।",
      },
      { status }
    );
  }
}
