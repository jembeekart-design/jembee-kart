import { NextRequest, NextResponse } from "next/server";

/* =========================
   CONFIG
========================= */

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/api/public"];
const ADMIN_ROUTES = ["/admin"];
const SELLER_ROUTES = ["/seller"];

/* =========================
   HELPER: AUTH CHECK
========================= */

function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) return null;

  try {
    // ⚠️ basic decode (real project में verify JWT server side)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

/* =========================
   HELPER: ROLE CHECK
========================= */

function hasAccess(path: string, role: string) {
  if (ADMIN_ROUTES.some(r => path.startsWith(r))) {
    return role === "admin";
  }

  if (SELLER_ROUTES.some(r => path.startsWith(r))) {
    return role === "seller" || role === "admin";
  }

  return true;
}

/* =========================
   HELPER: THEME SYSTEM
========================= */

function getTheme(req: NextRequest) {
  // admin panel se theme Firestore / cookie se aayega
  return (
    req.cookies.get("theme")?.value ||
    process.env.NEXT_PUBLIC_THEME_DEFAULT ||
    "glass"
  );
}

/* =========================
   RATE LIMIT (basic)
========================= */

const rateMap = new Map<string, { count: number; time: number }>();

function rateLimit(ip: string) {
  const now = Date.now();

  const record = rateMap.get(ip);

  if (!record) {
    rateMap.set(ip, { count: 1, time: now });
    return false;
  }

  if (now - record.time < 10000) {
    record.count += 1;

    if (record.count > 50) {
      return true;
    }
  } else {
    rateMap.set(ip, { count: 1, time: now });
  }

  return false;
}

/* =========================
   MAIN MIDDLEWARE
========================= */

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const ip =
    req.headers.get("x-forwarded-for") ||
    req.ip ||
    "unknown";

  /* ---------- RATE LIMIT ---------- */
  if (rateLimit(ip)) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  /* ---------- AUTH ---------- */
  const user = getUserFromRequest(req);

  if (!user && !PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /* ---------- ROLE GUARD ---------- */
  if (user && !hasAccess(pathname, user.role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  /* ---------- THEME SYNC ---------- */
  const theme = getTheme(req);

  const res = NextResponse.next();

  res.headers.set("x-theme", theme); // frontend use करेगा
  res.headers.set("x-app-version", "1.0.0");

  /* ---------- SECURITY ---------- */
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-XSS-Protection", "1; mode=block");

  return res;
}

/* =========================
   MATCHER
========================= */

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};