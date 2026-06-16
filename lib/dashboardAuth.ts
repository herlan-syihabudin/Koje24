// lib/dashboardAuth.ts

import crypto from "crypto";

export const COOKIE_NAME = "koje24_admin_session";

const SECRET = process.env.ADMIN_COOKIE_SECRET || "";

export function getMaxAgeSec() {
  return 60 * 60 * 12; // 12 jam
}

export function createSession(email: string, role: string = "staff") {
  if (!SECRET) throw new Error("Missing ADMIN_COOKIE_SECRET");

  const payload = { email, role, iat: Date.now() };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64");

  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("hex");

  return `${payloadB64}.${sig}`;
}

export function verifySession(raw?: string) {
  if (!raw || !SECRET) return null;

  const [payloadB64, sig] = raw.split(".");
  if (!payloadB64 || !sig) return null;

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("hex");

  if (expected !== sig) return null;

  try {
    return JSON.parse(
      Buffer.from(payloadB64, "base64").toString("utf8")
    ) as { email: string; role: string };
  } catch {
    return null;
  }
}
