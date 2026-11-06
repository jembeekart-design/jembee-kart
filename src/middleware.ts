import { NextRequest, NextResponse } from "next/server";

const retiredPublicPrefixes = [
  "/product",
  "/cart",
  "/checkout",
  "/orders",
  "/wishlist",
  "/categories",
  "/category",
  "/shipping",
  "/track-order",
  "/address",
  "/payment-success",
  "/affiliate",
  "/mlm",
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  // Keep the Shorts feature family reachable; only the old shopping/MLM areas redirect.
  if (pathname === "/mlm/watch-earn" || pathname.startsWith("/mlm/watch-earn/")) {
    return NextResponse.next();
  }

  const shouldRedirect = retiredPublicPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (shouldRedirect) {
    return NextResponse.redirect(new URL("/shorts", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/product/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/categories/:path*",
    "/category/:path*",
    "/shipping/:path*",
    "/track-order/:path*",
    "/address/:path*",
    "/payment-success/:path*",
    "/affiliate/:path*",
    "/mlm/:path*",
  ],
};
