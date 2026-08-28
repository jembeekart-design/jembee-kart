import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/firebase/admin";

type EventType = "impression" | "click";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing token" },
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(token);

    const body = await req.json();

    const adId = String(body.adId ?? "").trim();
    const eventType = body.eventType as EventType;
    const eventId = String(body.eventId ?? "").trim();

    if (!adId || !eventId) {
      return NextResponse.json(
        { success: false, message: "adId and eventId required" },
        { status: 400 }
      );
    }

    if (eventType !== "impression" && eventType !== "click") {
      return NextResponse.json(
        { success: false, message: "Invalid event type" },
        { status: 400 }
      );
    }

    const adRef = adminDb.collection("ads").doc(adId);

    // Unique event document prevents the same browser event
    // from being billed twice.
    const eventRef = adminDb
      .collection("adEvents")
      .doc(eventId);

    const result = await adminDb.runTransaction(async (transaction) => {
      const eventSnap = await transaction.get(eventRef);

      if (eventSnap.exists) {
        return {
          allowed: true,
          duplicate: true,
          charge: Number(eventSnap.data()?.charge ?? 0),
          remainingBudget: Number(
            eventSnap.data()?.remainingBudget ?? 0
          ),
        };
      }

      const adSnap = await transaction.get(adRef);

      if (!adSnap.exists) {
        return {
          allowed: false,
          reason: "Ad not found",
        };
      }

      const data = adSnap.data();

      if (data?.status !== "Running") {
        return {
          allowed: false,
          reason: "Ad is not running",
        };
      }

      const pricingModel =
        data?.pricingModel === "CPM" ? "CPM" : "CPC";

      const rate = Math.max(0, Number(data?.rate ?? 0));

      const currentBudget = Math.max(
        0,
        Number(data?.remainingBudget ?? data?.budget ?? 0)
      );

      if (currentBudget <= 0) {
        transaction.update(adRef, {
          status: "Completed",
          remainingBudget: 0,
          updatedAt: FieldValue.serverTimestamp(),
        });

        return {
          allowed: false,
          reason: "Budget exhausted",
        };
      }

      let charge = 0;

      if (eventType === "impression" && pricingModel === "CPM") {
        charge = Math.min(rate / 1000, currentBudget);
      }

      if (eventType === "click" && pricingModel === "CPC") {
        if (rate <= 0 || currentBudget < rate) {
          transaction.update(adRef, {
            status: "Completed",
            updatedAt: FieldValue.serverTimestamp(),
          });

          return {
            allowed: false,
            reason: "Insufficient budget",
          };
        }

        charge = rate;
      }

      const newRemainingBudget = Math.max(
        0,
        currentBudget - charge
      );

      const updateData: Record<string, unknown> = {
        revenue:
          Number(data?.revenue ?? 0) + charge,

        remainingBudget: newRemainingBudget,

        updatedAt: FieldValue.serverTimestamp(),
      };

      if (eventType === "impression") {
        updateData.impressions =
          Number(data?.impressions ?? 0) + 1;
      }

      if (eventType === "click") {
        updateData.clicks =
          Number(data?.clicks ?? 0) + 1;
      }

      if (newRemainingBudget <= 0) {
        updateData.status = "Completed";
      }

      transaction.update(adRef, updateData);

      transaction.set(eventRef, {
        adId,
        uid: decodedToken.uid,
        eventType,
        pricingModel,
        charge,
        remainingBudget: newRemainingBudget,
        createdAt: FieldValue.serverTimestamp(),
      });

      return {
        allowed: true,
        duplicate: false,
        charge,
        remainingBudget: newRemainingBudget,
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Ads event API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
