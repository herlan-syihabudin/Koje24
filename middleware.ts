import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookieName } from "@/lib/dashboardAuth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ BIARKAN LOGIN & API AUTH LEWAT
  if (
    pathname === "/dashboard/login" ||
    pathname.startsWith("/api/dashboard/login") ||
    pathname.startsWith("/api/dashboard/logout")
  ) {
    return NextResponse.next();
  }

  // 🔐 PROTEKSI DASHBOARD
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get(getCookieName())?.value;

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};
