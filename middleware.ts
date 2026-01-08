import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookieName } from "@/lib/dashboardAuth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🔐 Lindungi dashboard (kecuali halaman login)
  if (
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/dashboard/login")
  ) {
    const token = req.cookies.get(getCookieName())?.value;

    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/dashboard/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
