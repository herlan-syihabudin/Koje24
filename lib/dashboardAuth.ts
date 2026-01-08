import crypto from "crypto";

export const COOKIE_NAME = "koje_admin";

// 🔑 HARUS ADA di Vercel
const SECRET = process.env.ADMIN_COOKIE_SECRET as string;

if (!SECRET) {
  throw new Error("ADMIN_COOKIE_SECRET belum diset di ENV");
}

export function getCookieName() {
  return COOKIE_NAME;
}

export function getMaxAgeSec() {
  return 60 * 60 * 12; // 12 jam
}

export function createSession(email: string) {
  const payload = {
    email,
    iat: Date.now(),
  };

  const payloadB64 = Buffer
    .from(JSON.stringify(payload))
    .toString("base64");

  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("hex");

  return `${payloadB64}.${sig}`;
}

export function verifySession(raw?: string) {
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sig] = parts;

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("hex");

  if (sig !== expected) return null;

  try {
    return JSON.parse(
      Buffer.from(payloadB64, "base64").toString("utf8")
    ) as { email: string; iat: number };
  } catch {
    return null;
  }
}
