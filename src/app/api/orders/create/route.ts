import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { getCashfreeConfig } from "@/lib/payments/cashfree";

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
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 8192) return errorResponse("Request body too large.", 413);
    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > 8192) return errorResponse("Request body too large.", 413);
    let body: Record<string, unknown> | null = null;
    try {
      const parsed: unknown = JSON.parse(rawBody);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) body = parsed as Record<string, unknown>;
    } catch {
      return errorResponse("Invalid JSON request.", 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse("Invalid request.", 400);
    }

    const productId =
      typeof body.productId === "string" ? body.productId.trim() : "";

    const idempotencyKey =
      typeof body.idempotencyKey === "string"
        ? body.idempotencyKey.trim()
        : "";
    const selectedSize = typeof body.selectedSize === "string" ? body.selectedSize.trim() : "N/A";
    const selectedColor = typeof body.selectedColor === "string" ? body.selectedColor.trim() : "N/A";

    if (!productId || productId.length > 200) {
      return errorResponse("Invalid product.", 400);
    }

    if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
      return errorResponse("Invalid checkout request key. Please try again.", 400);
    }

    if (selectedSize.length > 50 || selectedColor.length > 100) {
      return errorResponse("Invalid product variant selection.", 400);
    }

    const paymentMethod = body.paymentMethod === "cashfree" ? "cashfree" : body.paymentMethod === "cod" ? "cod" : "";
    if (!paymentMethod) return errorResponse("Choose a supported payment method.", 400);
    if (paymentMethod === "cashfree") {
      try {
        await getCashfreeConfig();
      } catch {
        return errorResponse("Online payment is not enabled yet. Please choose Cash on Delivery.", 503);
      }
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

      // A retry of the same checkout returns the original order, but a reused
      // idempotency key must never silently resolve to a different cart payload.
      if (requestSnap.exists) {
        const previous = requestSnap.data()!;
        if (typeof previous.orderId !== "string" || !previous.orderId) {
          throw new Error("IDEMPOTENCY_RECORD_INCONSISTENT");
        }
        const previousOrderRef = db.collection("orders").doc(previous.orderId);
        const previousOrderSnap = await transaction.get(previousOrderRef);
        if (!previousOrderSnap.exists) throw new Error("IDEMPOTENCY_RECORD_INCONSISTENT");
        const previousOrder = previousOrderSnap.data()!;
        const previousStatus = typeof previousOrder.status === "string" ? previousOrder.status.toLowerCase() : "placed";
        const previousPaymentStatus = typeof previousOrder.paymentStatus === "string" ? previousOrder.paymentStatus.toLowerCase() : "";
        if (previousStatus === "cancelled" || previousPaymentStatus === "expired") {
          throw new Error("IDEMPOTENCY_KEY_TERMINAL");
        }
        const sameCheckout =
          previousOrder.productId === productId &&
          Number(previousOrder.quantity) === quantity &&
          (previousOrder.selectedSize || "N/A") === selectedSize &&
          (previousOrder.selectedColor || "N/A") === selectedColor &&
          previousOrder.paymentMethod === paymentMethod;
        if (!sameCheckout) throw new Error("IDEMPOTENCY_KEY_REUSED");

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

      const allowedSizes = Array.isArray(product.sizes) && product.sizes.length
        ? product.sizes.filter((value: unknown): value is string => typeof value === "string").slice(0, 30)
        : ["S", "M", "L", "XL", "XXL"];
      const allowedColors = Array.isArray(product.colors) && product.colors.length
        ? product.colors.filter((value: unknown): value is string => typeof value === "string").slice(0, 30)
        : ["var(--color-primary-button)", "var(--color-primary-button)", "var(--color-primary-button)", "var(--color-primary-button)"];
      if (selectedSize !== "N/A" && !allowedSizes.includes(selectedSize)) throw new Error("INVALID_PRODUCT_SIZE");
      if (selectedColor !== "N/A" && !allowedColors.includes(selectedColor)) throw new Error("INVALID_PRODUCT_COLOR");

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
      if (paymentMethod === "cashfree" && finalAmount < 1) {
        throw new Error("CASHFREE_MINIMUM_ORDER_AMOUNT");
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
        selectedSize,
        selectedColor,
        subtotal,
        discount: totalDiscount,
        finalAmount,
        paymentMethod,
        status: paymentMethod === "cashfree" ? "payment_pending" : "placed",
        paymentStatus: paymentMethod === "cashfree" ? "pending" : "not_required",
        ...(paymentMethod === "cashfree" ? { paymentExpiresAt: new Date(Date.now() + 30 * 60 * 1000) } : {}),
        referralEligible: true,
        cashbackProcessed: false,
        commissionProcessed: false,
        rewardProcessed: false,
        // Explicit inventory markers allow a later cancellation to restore stock
        // exactly once inside the same Admin SDK transaction.
        stockDeducted: true,
        stockRestocked: false,
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
      CASHFREE_MINIMUM_ORDER_AMOUNT: {
        message: "Online payment requires an order total of at least ₹1. Please choose Cash on Delivery or adjust the cart.",
        status: 409,
      },
      INVALID_PRODUCT_SIZE: { message: "The selected size is not available for this product.", status: 409 },
      INVALID_PRODUCT_COLOR: { message: "The selected color is not available for this product.", status: 409 },
      IDEMPOTENCY_KEY_REUSED: { message: "This checkout request key was already used for a different order selection. Please restart checkout.", status: 409 },
      IDEMPOTENCY_RECORD_INCONSISTENT: { message: "This checkout request could not be safely verified. Please contact support before retrying.", status: 409 },
      IDEMPOTENCY_KEY_TERMINAL: { message: "This checkout attempt has ended. Start a new checkout to place another order.", status: 409 },
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
