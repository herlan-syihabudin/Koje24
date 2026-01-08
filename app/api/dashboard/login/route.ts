import { NextResponse } from "next/server";
import { createSession, getCookieName, getMaxAgeSec } from "@/lib/dashboardAuth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const ADMIN_PASSWORD = process.env.DASHBOARD_PASSWORD;
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase());

  if (!ADMIN_PASSWORD || ADMIN_EMAILS.length === 0) {
    return NextResponse.json(
      { success: false, message: "Server auth belum diset" },
      { status: 500 }
    );
  }

  if (
    !ADMIN_EMAILS.includes(String(email).toLowerCase()) ||
    password !== ADMIN_PASSWORD
  ) {
    return NextResponse.json(
      { success: false, message: "Email atau password salah" },
      { status: 401 }
    );
  }

  const token = createSession(email);
  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: getCookieName(),
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: getMaxAgeSec(),
  });

  return res;
}
