import { NextResponse } from "next/server";
import { createSession, getCookieName, getMaxAgeSec } from "@/lib/dashboardAuth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const ADMIN_EMAIL = process.env.DASHBOARD_EMAIL;
  const ADMIN_PASSWORD = process.env.DASHBOARD_PASSWORD;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, message: "ENV admin belum diset" }, { status: 500 });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, message: "Email atau password salah" }, { status: 401 });
  }

  const token = createSession(email);
  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: getCookieName(),
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true, // oke di vercel
    maxAge: getMaxAgeSec(),
  });

  return res;
}
