import { NextResponse } from "next/server";
import { createSession, getCookieName, getMaxAgeSec } from "@/lib/dashboardAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    const okEmail = (process.env.DASHBOARD_EMAIL || "").trim().toLowerCase();
    const okPass = process.env.DASHBOARD_PASSWORD || "";

    if (!okEmail || !okPass) {
      return NextResponse.json(
        { ok: false, message: "ENV dashboard belum lengkap." },
        { status: 500 }
      );
    }

    if (email !== okEmail || password !== okPass) {
      return NextResponse.json({ ok: false, message: "Email / password salah." }, { status: 401 });
    }

    const token = createSession(email);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: getMaxAgeSec(),
    });

    return res;
  } catch {
    return NextResponse.json({ ok: false, message: "Bad request" }, { status: 400 });
  }
}
