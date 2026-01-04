import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const ADMIN_EMAIL = process.env.DASHBOARD_EMAIL;
    const ADMIN_PASSWORD = process.env.DASHBOARD_PASSWORD;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: "ENV admin belum diset" },
        { status: 500 }
      );
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ success: true });

    res.cookies.set({
      name: "dashboard_token",
      value: "koje24-admin",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 8, // 8 jam
    });

    return res;
  } catch (e) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
