// lib/dashboardAuth.ts

import crypto from "crypto";

// =======================
// CONSTANTS
// =======================
export const COOKIE_NAME = "koje24_admin_session";
const SECRET = process.env.ADMIN_COOKIE_SECRET || "";

// =======================
// COOKIE HELPERS
// =======================
export function getCookieName() {
  return COOKIE_NAME;
}

export function getMaxAgeSec() {
  return 60 * 60 * 12; // 12 jam
}

// =======================
// SESSION HELPERS
// =======================
export function createSession(email: string, role: string = "staff") {
  if (!SECRET) {
    console.error("❌ ADMIN_COOKIE_SECRET not set");
    // Fallback: pake random string
    const fallbackToken = Buffer.from(JSON.stringify({ email, role, iat: Date.now() })).toString("base64");
    return fallbackToken;
  }

  const payload = { email, role, iat: Date.now() };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64");

  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("hex");

  return `${payloadB64}.${sig}`;
}

export function verifySession(raw?: string) {
  if (!raw) return null;

  // 🔥 Fallback: coba parse tanpa signature (kalau SECRET kosong)
  if (!SECRET) {
    try {
      return JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    } catch {
      return null;
    }
  }

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
