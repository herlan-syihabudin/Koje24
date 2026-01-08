import { NextResponse } from "next/server";
import { createSession, getMaxAgeSec } from "@/lib/dashboardAuth";

/**
 * ⚠️ HARUS KONSISTEN:
 * COOKIE NAME = "koje_admin"
 * (JANGAN import getCookieName di API login biar lebih simpel & aman)
 */
const COOKIE_NAME = "koje_admin";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const ADMIN_EMAIL = process.env.DASHBOARD_EMAIL;
  const ADMIN_PASSWORD = process.env.DASHBOARD_PASSWORD;

  // ❌ ENV belum diset
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return NextResponse.json(
      { success: false, message: "ENV admin belum diset" },
      { status: 500 }
    );
  }

  // ❌ kredensial salah
  if (
    String(email).trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
    String(password) !== ADMIN_PASSWORD
  ) {
    return NextResponse.json(
      { success: false, message: "Email atau password salah" },
      { status: 401 }
    );
  }

  // ✅ buat session token
  const token = createSession(ADMIN_EMAIL);

  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: COOKIE_NAME,               // 🔐 SAMA DENGAN MIDDLEWARE
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // penting Safari
    maxAge: getMaxAgeSec(),           // 12 jam
  });

  return res;
}
