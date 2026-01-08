import { NextResponse } from "next/server";
import { createSession, getCookieName, getMaxAgeSec } from "@/lib/dashboardAuth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.DASHBOARD_PASSWORD
  ) {
    return NextResponse.json(
      { success: false, message: "Email / password salah" },
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
