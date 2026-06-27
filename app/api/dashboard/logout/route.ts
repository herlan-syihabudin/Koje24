import { NextResponse } from "next/server";

const COOKIE_NAME = "koje_admin";

export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return res;
}
