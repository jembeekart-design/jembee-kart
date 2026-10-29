import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

export const runtime = "nodejs";

function errorResponse(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse("Please log in to place your order.", 401);
    }

    let decodedToken;

    try {
      decodedToken = await getAdminAuth().verifyIdToken(
        authHeader.slice(7).trim(),
        true
      );
    } catch {
      return errorResponse("Your session is invalid. Please log in again.", 401);
    }

    const userId = decodedToken.uid;
    const parsed = await readBoundedJson(req, 8 * 1024);
    if (!parsed.ok) return errorResponse(parsed.message, parsed.status);
    if (!parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
      return errorResponse("Invalid request.", 400);
    }
    const body = parsed.value as Record<string, unknown>;

    const productId =
      typeof body.productId === "string" ? body.productId.trim() : "";

    const idempotencyKey =
      typeof body.idempotencyKey === "string"
        ? body.idempotencyKey.trim()
        : "";

    if (!productId || productId.length > 200) {
      return errorResponse("Invalid product.", 400);
    }

    if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
      return errorResponse("Invalid checkout request key. Please try again.", 400);
    }

    if (body.paymentMethod !== "cod") {
      return errorResponse("Only Cash on Delivery is currently supported.", 400);
    }

    const quantity = Number(body.quantity ?? 1);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return errorResponse("Quantity must be between 1 and 20.", 400);
    }

    const db = getAdminDb();

    const addressRef = db
      .collection("users")
      .doc(userId)
      .collection("addresses")
      .doc("default");

    const productRef = db.collection("products").doc(productId);

    // The key is scoped to the authenticated customer.
    const requestRef = db
      .collection("orderRequests")
      .doc(`${userId}_${idempotencyKey}`);

    const result = await db.runTransaction(async (transaction) => {
      // Read all documents before writing anything.
      const requestSnap = await transaction.get(requestRef);
      const addressSnap = await transaction.get(addressRef);
      const productSnap = await transaction.get(productRef);

      // A retry of the same checkout returns the original order.
      if (requestSnap.exists) {
        const previous = requestSnap.data()!;

        return {
          orderId: previous.orderId as string,
          orderNumber: previous.orderNumber as string,
          finalAmount: previous.finalAmount as number,
          duplicate: true,
        };
      }

      if (!addressSnap.exists) {
        throw new Error("ADDRESS_NOT_FOUND");
      }

      const address = addressSnap.data()!;

      const requiredAddressFields = [
        "fullName",
        "mobile",
        "address",
        "city",
        "state",
        "pincode",
      ] as const;

      for (const field of requiredAddressFields) {
        if (
          typeof address[field] !== "string" ||
          !address[field].trim()
        ) {
          throw new Error("ADDRESS_INCOMPLETE");
        }
      }

      if (!/^\d{10}$/.test(address.mobile.trim())) {
        throw new Error("ADDRESS_INVALID_MOBILE");
      }

      if (!/^\d{6}$/.test(address.pincode.trim())) {
        throw new Error("ADDRESS_INVALID_PINCODE");
      }

      if (!productSnap.exists) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const product = productSnap.data()!;

      if (product.visible !== true) {
        throw new Error("PRODUCT_UNAVAILABLE");
      }

      // The existing admin product form stores price as a number.
      if (
        typeof product.price !== "number" ||
        !Number.isFinite(product.price) ||
        product.price <= 0
      ) {
        throw new Error("INVALID_PRODUCT_PRICE");
      }

      const price = product.price;

      // The existing admin form uses discountPrice = 0 for no discount.
      const rawDiscountPrice = product.discountPrice;

      if (
        rawDiscountPrice !== undefined &&
        (
          typeof rawDiscountPrice !== "number" ||
          !Number.isFinite(rawDiscountPrice) ||
          rawDiscountPrice < 0 ||
          rawDiscountPrice > price
        )
      ) {
        throw new Error("INVALID_PRODUCT_DISCOUNT");
      }

      const discountPrice =
        rawDiscountPrice === undefined || rawDiscountPrice === 0
          ? price
          : rawDiscountPrice;

      // The existing product form initializes stock to zero.
      // Missing or invalid stock is rejected rather than treated as unlimited.
      if (
        typeof product.stock !== "number" ||
        !Number.isSafeInteger(product.stock) ||
        product.stock < 0
      ) {
        throw new Error("INVALID_PRODUCT_STOCK");
      }

      if (product.stock < quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      const subtotal = Math.round(price * quantity * 100) / 100;
      const finalAmount =
        Math.round(discountPrice * quantity * 100) / 100;
      const totalDiscount =
        Math.round((subtotal - finalAmount) * 100) / 100;

      if (
        !Number.isFinite(subtotal) ||
        !Number.isFinite(finalAmount) ||
        finalAmount <= 0
      ) {
        throw new Error("INVALID_ORDER_AMOUNT");
      }

      const orderRef = db.collection("orders").doc();

      const orderNumber =
        `JK-${Date.now()}-${orderRef.id.slice(0, 8).toUpperCase()}`;

      const orderData = {
        orderNumber,
        userId,
        customerName: address.fullName.trim(),
        customerPhone: address.mobile.trim(),
        shippingAddress: {
          fullName: address.fullName.trim(),
          mobile: address.mobile.trim(),
          address: address.address.trim(),
          landmark:
            typeof address.landmark === "string"
              ? address.landmark.trim()
              : "",
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode.trim(),
        },
        productId: productSnap.id,
        productTitle:
          typeof product.title === "string" ? product.title : "Product",
        productImage:
          Array.isArray(product.images) &&
          typeof product.images[0] === "string"
            ? product.images[0]
            : typeof product.image === "string"
              ? product.image
              : "",
        productPrice: price,
        productDiscountPrice: discountPrice,
        quantity,
        subtotal,
        discount: totalDiscount,
        finalAmount,
        paymentMethod: "cod",
        status: "placed",
        referralEligible: true,
        cashbackProcessed: false,
        commissionProcessed: false,
        rewardProcessed: false,
        exchangeEligible: true,
        exchangeRequested: false,
        placedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        sellerId:
          typeof product.sellerId === "string"
            ? product.sellerId
            : "default_seller",
        sellerName:
          typeof product.sellerName === "string"
            ? product.sellerName
            : "JembeeKart Official",
      };

      // Stock decrement, order creation, and idempotency record
      // are committed together or not committed at all.
      transaction.update(productRef, {
        stock: product.stock - quantity,
      });

      transaction.create(orderRef, orderData);

      transaction.create(requestRef, {
        userId,
        orderId: orderRef.id,
        orderNumber,
        finalAmount,
        createdAt: FieldValue.serverTimestamp(),
      });

      return {
        orderId: orderRef.id,
        orderNumber,
        finalAmount,
        duplicate: false,
      };
    });

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      finalAmount: result.finalAmount,
      duplicate: result.duplicate,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";

    const knownErrors: Record<string, { message: string; status: number }> = {
      ADDRESS_NOT_FOUND: {
        message: "Please save your delivery address first.",
        status: 400,
      },
      ADDRESS_INCOMPLETE: {
        message: "Please complete your delivery address.",
        status: 400,
      },
      ADDRESS_INVALID_MOBILE: {
        message: "The saved mobile number is invalid.",
        status: 400,
      },
      ADDRESS_INVALID_PINCODE: {
        message: "The saved PIN code is invalid.",
        status: 400,
      },
      PRODUCT_NOT_FOUND: {
        message: "Product not found.",
        status: 404,
      },
      PRODUCT_UNAVAILABLE: {
        message: "This product is not currently available.",
        status: 409,
      },
      INVALID_PRODUCT_PRICE: {
        message: "The product price is not configured correctly.",
        status: 409,
      },
      INVALID_PRODUCT_DISCOUNT: {
        message: "The product discount is not configured correctly.",
        status: 409,
      },
      INVALID_PRODUCT_STOCK: {
        message: "The product inventory needs to be checked by the store.",
        status: 409,
      },
      INSUFFICIENT_STOCK: {
        message: "Insufficient stock. Please refresh the product and try again.",
        status: 409,
      },
      INVALID_ORDER_AMOUNT: {
        message: "The order amount is invalid.",
        status: 409,
      },
    };

    if (knownErrors[code]) {
      return errorResponse(
        knownErrors[code].message,
        knownErrors[code].status
      );
    }

    console.error(
      "ORDER_CREATION_ERROR:",
      error instanceof Error ? error.message : "unknown"
    );

    return errorResponse("Unable to place your order. Please try again.", 500);
  }
}
