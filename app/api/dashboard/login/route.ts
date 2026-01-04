import { NextResponse } from "next/server";
import { createSession } from "@/lib/dashboardAuth";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  if (
    email !== process.env.DASHBOARD_EMAIL ||
    password !== process.env.DASHBOARD_PASSWORD
  ) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const token = createSession(email);

  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: "dashboard_token",
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return res;
}
