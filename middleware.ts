// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// =======================
// CONSTANTS
// =======================
const COOKIE_NAME = "koje24_admin_session";
const DASHBOARD_PATH = "/dashboard";
const LOGIN_PATH = "/dashboard/login";
const API_DASHBOARD_PATH = "/api/dashboard";

// 🔥 Whitelist API endpoints yang boleh tanpa auth
const PUBLIC_API_PATHS = [
  "/api/dashboard/login",
  "/api/dashboard/health",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // =======================
  // 1. LEWATKAN PUBLIC API
  // =======================
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // =======================
  // 2. API DASHBOARD → HARUS ADA TOKEN
  // =======================
  if (pathname.startsWith(API_DASHBOARD_PATH)) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // =======================
  // 3. LOGIN PAGE → REDIRECT JIKA SUDAH LOGIN
  // =======================
  if (pathname === LOGIN_PATH) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      return NextResponse.redirect(new URL(DASHBOARD_PATH, req.url));
    }
    return NextResponse.next();
  }

  // =======================
  // 4. DASHBOARD → CEK TOKEN
  // =======================
  if (pathname.startsWith(DASHBOARD_PATH)) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/dashboard/:path*",
  ],
};
