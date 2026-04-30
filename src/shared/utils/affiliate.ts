// 🔥 JembeeKart Affiliate System (₹30L level)

type AffiliateLink = {
  code: string;
  productId: string;
  userId: string;
  createdAt: number;
};

type AffiliateClick = {
  code: string;
  productId: string;
  userId: string;
  timestamp: number;
};

type AffiliateOrder = {
  orderId: string;
  code: string;
  commission: number;
};

let links: AffiliateLink[] = [];
let clicks: AffiliateClick[] = [];
let orders: AffiliateOrder[] = [];

/* =========================================================
   🔗 GENERATE AFFILIATE LINK
========================================================= */

export const generateAffiliateLink = (
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
   👆 TRACK CLICK
========================================================= */

export const trackAffiliateClick = (code: string) => {
  const link = links.find((l) => l.code === code);
  if (!link) return;

  clicks.push({
    code,
    productId: link.productId,
    userId: link.userId,
    timestamp: Date.now(),
  });
};

/* =========================================================
   💰 APPLY COMMISSION
========================================================= */

let commissionRate = 10; // 🔥 Admin control (10%)

export const setCommissionRate = (rate: number) => {
  commissionRate = rate;
};

export const calculateCommission = (amount: number) => {
  return Math.round((amount * commissionRate) / 100);
};

/* =========================================================
   📦 ATTACH AFFILIATE TO ORDER
========================================================= */

export const attachAffiliateToOrder = (
  orderId: string,
  code: string,
  amount: number
) => {
  const commission = calculateCommission(amount);

  orders.push({
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
   📊 ANALYTICS
========================================================= */

export const getAffiliateStats = (userId: string) => {
  const userLinks = links.filter((l) => l.userId === userId);

  const userClicks = clicks.filter((c) => c.userId === userId);

  const userOrders = orders.filter((o) =>
    userLinks.some((l) => l.code === o.code)
  );

  const totalCommission = userOrders.reduce(
    (sum, o) => sum + o.commission,
    0
  );

  return {
    links: userLinks.length,
    clicks: userClicks.length,
    orders: userOrders.length,
    earnings: totalCommission,
  };
};

/* =========================================================
   🔍 GET AFFILIATE FROM URL
========================================================= */

export const getAffiliateCodeFromURL = () => {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  return params.get("ref");
};

/* =========================================================
   ⚡ CACHE / RESET (Admin tools)
========================================================= */

export const clearAffiliateData = () => {
  links = [];
  clicks = [];
  orders = [];
};