import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🔐 PROTEKSI DASHBOARD
  if (pathname.startsWith("/dashboard")) {
    const adminToken = req.cookies.get("admin_token")?.value;

    if (!adminToken) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

/* =====================
   ROUTE YANG DIJAGA
===================== */
export const config = {
  matcher: ["/dashboard/:path*"],
};
