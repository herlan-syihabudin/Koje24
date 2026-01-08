import { NextResponse } from "next/server";
import { createSession, getCookieName, getMaxAgeSec } from "@/lib/dashboardAuth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const ADMIN_PASSWORD = process.env.DASHBOARD_PASSWORD || "";
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!ADMIN_PASSWORD || ADMIN_EMAILS.length === 0) {
    return NextResponse.json(
      { success: false, message: "Server auth belum diset (ENV kosong)" },
      { status: 500 }
    );
  }

  const emailNorm = String(email || "").trim().toLowerCase();
  const passNorm = String(password || "").trim();

  if (!ADMIN_EMAILS.includes(emailNorm) || passNorm !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { success: false, message: "Email / password salah" },
      { status: 401 }
    );
  }

  const token = createSession(emailNorm);
  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: getCookieName(),
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true, // Vercel https -> aman
    maxAge: getMaxAgeSec(),
  });

  return res;
}
