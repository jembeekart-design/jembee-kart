// src/shared/modules/affiliate/affiliateService.ts

import { calculateCommission } from "./commissionEngine";
import { trackClick, trackOrder } from "./trackingService";

type AffiliateLink = {
  code: string;
  productId: string;
  userId: string;
  createdAt: number;
};

let links: AffiliateLink[] = [];

/* =========================================================
   🔗 GENERATE LINK
========================================================= */

export const createAffiliateLink = (
  userId: string,
  productId: string
) => {
  const code = `${userId}_${productId}_${Date.now()}`;

  const link: AffiliateLink = {
    code,
    productId,
    userId,
    createdAt: Date.now(),
  };

  links.push(link);

  return `${process.env.NEXT_PUBLIC_APP_URL}/product/${productId}?ref=${code}`;
};

/* =========================================================
   👆 HANDLE CLICK
========================================================= */

export const handleAffiliateClick = (code: string) => {
  const link = links.find((l) => l.code === code);
  if (!link) return;

  trackClick({
    code,
    productId: link.productId,
    userId: link.userId,
    time: Date.now(),
  });
};

/* =========================================================
   📦 ATTACH TO ORDER
========================================================= */

export const applyAffiliateToOrder = (
  orderId: string,
  code: string,
  amount: number
) => {
  const commission = calculateCommission(amount);

  trackOrder({
    orderId,
    code,
    commission,
  });

  return {
    orderId,
    code,
    commission,
  };
};

/* =========================================================
   🔍 GET CODE FROM URL
========================================================= */

export const getAffiliateCode = () => {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  return params.get("ref");
};

/* =========================================================
   📊 USER STATS
========================================================= */

export const getUserAffiliateStats = (userId: string) => {
  const userLinks = links.filter((l) => l.userId === userId);

  return {
    totalLinks: userLinks.length,
  };
};