// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "koje_admin"; // HARD CODE (EDGE SAFE)

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Biarkan login & API lewat
  if (
    pathname === "/dashboard/login" ||
    pathname.startsWith("/api/dashboard")
  ) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(
        new URL("/dashboard/login", req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
