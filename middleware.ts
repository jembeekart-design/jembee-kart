// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // अभी कोई blocking / auth check नहीं
  return NextResponse.next();
}

// 👉 किन routes पर चलेगा
export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
  ],
};
