import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, getCookieName } from "@/lib/dashboardAuth";

export function requireAdminFromRequest(req: NextRequest) {
  const raw = req.cookies.get(getCookieName())?.value;
  const payload = verifySession(raw);

  if (!payload) {
    return {
      ok: false,
      res: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!allow.includes(payload.email.toLowerCase())) {
    return {
      ok: false,
      res: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, admin: payload };
}
