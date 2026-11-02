export type ShippingPolicy = {
  shippingConfigured?: boolean;
  freeShipping?: boolean;
  shippingCharge?: number;
  freeShippingThreshold?: number | null;
  deliveryDays?: number;
};

export type InvoiceProduct = {
  price?: unknown;
  discountPrice?: unknown;
};

export type InvoiceBreakdown = {
  currency: "INR";
  quantity: number;
  unitPrice: number;
  unitDiscountPrice: number;
  subtotalPaise: number;
  discountPaise: number;
  itemTotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  deliveryDays: number;
};

function toPaise(value: number): number {
  const scaled = value * 100;
  if (!Number.isFinite(value) || value < 0 || value > 10000000 ||
      !Number.isFinite(scaled) || Math.abs(scaled - Math.round(scaled)) > 1e-7) {
    throw new Error("INVALID_INVOICE_AMOUNT");
  }
  const paise = Math.round(value * 100);
  if (!Number.isSafeInteger(paise)) throw new Error("INVALID_INVOICE_AMOUNT");
  return paise;
}

export function calculateInvoice(
  product: InvoiceProduct,
  shipping: ShippingPolicy,
  quantity: number,
): InvoiceBreakdown {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    throw new Error("INVALID_QUANTITY");
  }
  if (shipping.shippingConfigured !== true) throw new Error("SHIPPING_NOT_CONFIGURED");
  if (typeof product.price !== "number" || !Number.isFinite(product.price) || product.price <= 0) {
    throw new Error("INVALID_PRODUCT_PRICE");
  }
  const price = product.price;
  const rawDiscount = product.discountPrice;
  if (rawDiscount !== undefined && (
    typeof rawDiscount !== "number" || !Number.isFinite(rawDiscount) ||
    rawDiscount < 0 || rawDiscount > price
  )) throw new Error("INVALID_PRODUCT_DISCOUNT");
  const unitDiscountPrice = rawDiscount === undefined || rawDiscount === 0 ? price : rawDiscount;
  const subtotalPaise = toPaise(price) * quantity;
  const itemTotalPaise = toPaise(unitDiscountPrice) * quantity;
  const discountPaise = subtotalPaise - itemTotalPaise;

  const shippingCharge = shipping.shippingCharge;
  if (typeof shippingCharge !== "number") throw new Error("INVALID_SHIPPING_SETTINGS");
  let shippingPaise = toPaise(shippingCharge);
  const threshold = shipping.freeShippingThreshold;
  if (threshold !== null && threshold !== undefined) {
    if (typeof threshold !== "number") throw new Error("INVALID_SHIPPING_SETTINGS");
    if (itemTotalPaise >= toPaise(threshold)) shippingPaise = 0;
  }
  if (shipping.freeShipping === true) shippingPaise = 0;

  const totalPaise = itemTotalPaise + shippingPaise;
  if (!Number.isSafeInteger(subtotalPaise) || !Number.isSafeInteger(itemTotalPaise) ||
      !Number.isSafeInteger(totalPaise) || totalPaise <= 0) {
    throw new Error("INVALID_INVOICE_AMOUNT");
  }
  const deliveryDays = Number.isInteger(shipping.deliveryDays) &&
    Number(shipping.deliveryDays) >= 0 && Number(shipping.deliveryDays) <= 90
    ? Number(shipping.deliveryDays) : 0;

  return {
    currency: "INR",
    quantity,
    unitPrice: price,
    unitDiscountPrice,
    subtotalPaise,
    discountPaise,
    itemTotalPaise,
    shippingPaise,
    totalPaise,
    deliveryDays,
  };
}

export function paiseToRupees(paise: number): number {
  if (!Number.isSafeInteger(paise) || paise < 0) throw new Error("INVALID_INVOICE_AMOUNT");
  return paise / 100;
}
