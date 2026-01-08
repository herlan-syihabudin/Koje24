import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "koje_admin";
const SECRET = process.env.ADMIN_COOKIE_SECRET || "";

// format token simpel: base64(payload).hex(hmac)
// payload: {"email":"x@x.com","ts":123}
export function requireAdmin() {
  if (!SECRET) {
    return { ok: false, res: NextResponse.json({ success: false, message: "Server misconfigured" }, { status: 500 }) };
  }

  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) {
    return { ok: false, res: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) };
  }

  const [payloadB64, sig] = raw.split(".");
  if (!payloadB64 || !sig) {
    return { ok: false, res: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) };
  }

  const expected = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("hex");
  if (expected !== sig) {
    return { ok: false, res: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) };
  }

  const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));

  // allowlist admin email (paling aman)
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!payload?.email || !allow.includes(String(payload.email).toLowerCase())) {
    return { ok: false, res: NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true, admin: payload };
}
