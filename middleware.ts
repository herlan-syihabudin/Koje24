import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // hanya proteksi dashboard
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // contoh: cookie admin token (HttpOnly) bernama "koje_admin"
  const token = req.cookies.get("koje_admin")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login"; // sesuaikan route login admin lu
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
