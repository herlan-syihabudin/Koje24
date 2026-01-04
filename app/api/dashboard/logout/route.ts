import { NextResponse } from "next/server";
import { getCookieName } from "@/lib/dashboardAuth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(getCookieName(), "", { path: "/", maxAge: 0 });
  return res;
}
