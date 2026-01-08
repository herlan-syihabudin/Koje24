import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookieName } from "@/lib/dashboardAuth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // biarin login page & semua API dashboard lewat
  if (pathname === "/dashboard/login" || pathname.startsWith("/api/dashboard")) {
    return NextResponse.next();
  }

  // proteksi semua /dashboard/*
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get(getCookieName())?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/dashboard/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
