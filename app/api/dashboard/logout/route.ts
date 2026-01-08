import { NextResponse } from "next/server";
import { getCookieName } from "@/lib/dashboardAuth";

export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: getCookieName(),
    value: "",
    path: "/",
    maxAge: 0,
  });

  return res;
}
