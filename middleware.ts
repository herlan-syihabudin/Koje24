import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ⚠️ HARUS SAMA DENGAN:
 * export const COOKIE_NAME = "koje_admin";
 */
const COOKIE_NAME = "koje_admin";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /**
   * ✅ IZINKAN:
   * - halaman login
   * - semua API dashboard (login, logout, dll)
   */
  if (
    pathname === "/dashboard/login" ||
    pathname.startsWith("/api/dashboard")
  ) {
    return NextResponse.next();
  }

  /**
   * 🔐 PROTEKSI SEMUA /dashboard/*
   * ❌ TIDAK VERIFY TOKEN
   * ❌ TIDAK IMPORT crypto
   * ❌ EDGE SAFE
   */
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
