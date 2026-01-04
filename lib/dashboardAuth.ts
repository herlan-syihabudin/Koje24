import crypto from "crypto";

const COOKIE_NAME = "koje24_dash";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 hari

function getSecret() {
  return process.env.DASHBOARD_SECRET || process.env.DASHBOARD_PASSWORD || "dev-secret";
}

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function b64urlDecode(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(base64, "base64");
}

function sign(payload: string) {
  return b64url(crypto.createHmac("sha256", getSecret()).update(payload).digest());
}

export function createSession(email: string) {
  const ts = Date.now();
  const payload = `${email}|${ts}`;
  const sig = sign(payload);
  return b64url(`${payload}|${sig}`);
}

export function verifySession(token: string | undefined | null) {
  if (!token) return { ok: false as const };

  try {
    const raw = b64urlDecode(token).toString("utf8");
    const [email, tsStr, sig] = raw.split("|");
    if (!email || !tsStr || !sig) return { ok: false as const };

    const ts = Number(tsStr);
    if (!Number.isFinite(ts)) return { ok: false as const };

    const ageSec = (Date.now() - ts) / 1000;
    if (ageSec > MAX_AGE_SEC) return { ok: false as const };

    const expected = sign(`${email}|${ts}`);
    if (expected !== sig) return { ok: false as const };

    return { ok: true as const, email };
  } catch {
    return { ok: false as const };
  }
}

export function getCookieName() {
  return COOKIE_NAME;
}

export function getMaxAgeSec() {
  return MAX_AGE_SEC;
}
