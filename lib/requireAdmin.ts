import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "koje_admin";
const SECRET = process.env.ADMIN_COOKIE_SECRET!;

export async function requireAdmin() {
  const cookieStore = cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (!raw) {
    return { ok: false, res: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const [payloadB64, sig] = raw.split(".");
  const expected = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("hex");

  if (expected !== sig) {
    return { ok: false, res: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));

  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase());

  if (!allow.includes(payload.email?.toLowerCase())) {
    return { ok: false, res: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true, admin: payload };
}
