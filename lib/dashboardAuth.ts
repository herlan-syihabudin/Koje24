import crypto from "crypto";

export const COOKIE_NAME = "koje_admin";
const SECRET = process.env.ADMIN_COOKIE_SECRET || "";

export function getCookieName() {
  return COOKIE_NAME;
}

export function getMaxAgeSec() {
  return 60 * 60 * 12; // 12 jam
}

type SessionPayload = {
  email: string;
  iat: number;
};

function b64urlEncode(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function b64urlDecode(input: string) {
  const pad = input.length % 4 ? "=".repeat(4 - (input.length % 4)) : "";
  const b64 = input.replaceAll("-", "+").replaceAll("_", "/") + pad;
  return Buffer.from(b64, "base64").toString("utf8");
}

export function createSession(email: string) {
  if (!SECRET) throw new Error("Missing ADMIN_COOKIE_SECRET");

  const payload: SessionPayload = { email, iat: Date.now() };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = b64urlEncode(payloadStr);

  const sig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("hex");
  return `${payloadB64}.${sig}`;
}

export function verifySession(raw?: string): SessionPayload | null {
  if (!raw || !SECRET) return null;

  const [payloadB64, sig] = raw.split(".");
  if (!payloadB64 || !sig) return null;

  const expected = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("hex");
  if (expected !== sig) return null;

  try {
    return JSON.parse(b64urlDecode(payloadB64));
  } catch {
    return null;
  }
}
