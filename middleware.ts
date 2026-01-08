import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("koje_admin")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      loginUrl.pathname = "/dashboard/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard/:path*"],
};
