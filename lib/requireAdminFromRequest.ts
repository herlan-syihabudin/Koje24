import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, getCookieName } from "@/lib/dashboardAuth";

export type AdminPayload = {
  email: string;
};

export function requireAdminFromRequest(req: NextRequest) {
  const raw = req.cookies.get(getCookieName())?.value;
  const payload = verifySession(raw) as AdminPayload | null;

  // ❌ tidak login / token invalid
  if (!payload) {
    return {
      ok: false,
      res: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  // 🔐 whitelist admin email
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allow.length && !allow.includes(payload.email.toLowerCase())) {
    return {
      ok: false,
      res: NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    admin: payload,
  };
}
