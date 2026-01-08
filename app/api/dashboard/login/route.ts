import { NextResponse } from "next/server";
import { createSession, getMaxAgeSec } from "@/lib/dashboardAuth";

const COOKIE_NAME = "koje_admin";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const ADMIN_EMAILS = process.env.ADMIN_EMAILS; // ✅ INI YANG ADA
  const ADMIN_PASSWORD = process.env.DASHBOARD_PASSWORD;

  // ❌ ENV belum diset
  if (!ADMIN_EMAILS || !ADMIN_PASSWORD) {
    return NextResponse.json(
      { success: false, message: "ENV admin belum diset" },
      { status: 500 }
    );
  }

  const allowEmails = ADMIN_EMAILS
    .split(",")
    .map((e) => e.trim().toLowerCase());

  // ❌ kredensial salah
  if (
    !allowEmails.includes(String(email).toLowerCase()) ||
    String(password) !== ADMIN_PASSWORD
  ) {
    return NextResponse.json(
      { success: false, message: "Email atau password salah" },
      { status: 401 }
    );
  }

  // ✅ buat session
  const token = createSession(String(email).toLowerCase());

  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: getMaxAgeSec(),
  });

  return res;
}
