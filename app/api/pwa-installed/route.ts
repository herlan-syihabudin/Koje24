// app/api/pwa-install/route.ts

import { NextResponse } from "next/server";
import { RateLimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { google } from "googleapis";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SHEET_NAME = "PWA_INSTALL";

// =======================
// 🔥 RATE LIMIT DENGAN REDIS
// =======================
const ratelimit = new RateLimit({
  redis: Redis.fromEnv(),
  limiter: RateLimit.slidingWindow(10, "60s"),
  analytics: true,
});

// =======================
// 🔥 CACHE AUTH
// =======================
let cachedAuth: any = null;
let authExpiry: number = 0;

function getAuth() {
  const now = Date.now();
  if (cachedAuth && now < authExpiry) {
    return cachedAuth;
  }

  const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
  const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY;

  if (!CLIENT_EMAIL || !PRIVATE_KEY_RAW) {
    throw new Error("Google credentials missing");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY_RAW.replace(/\\n/g, "\n").trim(),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedAuth = auth;
  authExpiry = now + 50 * 60 * 1000;
  return auth;
}

// =======================
// 🔥 DETEKSI IP YANG BENER
// =======================
function getClientIP(req: Request): string {
  const headers = req.headers;

  // 1. Cloudflare
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf;

  // 2. X-Forwarded-For (ambil IP pertama)
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // 3. X-Real-IP
  const real = headers.get("x-real-ip");
  if (real) return real;

  // ✅ FIX: Kalau semua gagal, return "unknown" (BUKAN host!)
  return "unknown";
}

// =======================
// 🔥 RATE LIMIT KEY YANG LEBIH AKURAT
// =======================
function getRateLimitKey(req: Request): string {
  const ip = getClientIP(req);

  // Ambil user agent
  const ua = req.headers.get("user-agent") || "unknown";

  // Hash user agent (biar gak kepanjangan)
  const uaHash = createHash("sha256").update(ua).digest("hex").substring(0, 8);

  // Ambil source dari body (kalau ada)
  let source = "direct";
  try {
    // Clone request biar bisa baca body
    const clone = req.clone();
    clone.json().then((body) => {
      source = body.source || "direct";
    }).catch(() => {});
  } catch {}

  // 🔥 Kombinasi: IP + UA Hash + Source
  // Contoh: "192.168.1.1_a1b2c3d4_homepage"
  return `${ip}_${uaHash}_${source}`;
}

// =======================
// 🔥 RETRY LOGIC
// =======================
async function appendWithRetry(
  sheets: any,
  spreadsheetId: string,
  range: string,
  values: any[],
  maxRetries: number = 3
): Promise<any> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Retry ${i + 1}/${maxRetries} failed`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw lastError;
}

// =======================
// MAIN HANDLER
// =======================
export async function POST(req: Request) {
  try {
    // 🔥 RATE LIMIT PAKE KEY YANG LEBIH AKURAT
    const key = getRateLimitKey(req);
    const { success } = await ratelimit.limit(key);

    if (!success) {
      const ip = getClientIP(req);
      console.warn(`🚫 Rate limited: ${key}`);
      return NextResponse.json(
        { ok: false, message: "Too many requests" },
        { status: 429 }
      );
    }

    // =======================
    // VALIDASI ENV
    // =======================
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;
    if (!SHEET_ID) {
      console.error("❌ Google Sheets ID missing");
      return NextResponse.json(
        { ok: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    // =======================
    // VALIDASI BODY
    // =======================
    const body = await req.json();
    if (!body) {
      return NextResponse.json(
        { ok: false, message: "Request body is required" },
        { status: 400 }
      );
    }

    const platform = body.platform || "unknown";
    const ua = body.ua || "unknown";
    const source = body.source || "direct";
    const ip = getClientIP(req);

    console.log(`📱 PWA Install: ${platform} | ${source} | ${ip}`);

    // =======================
    // GOOGLE SHEETS AUTH
    // =======================
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // =======================
    // APPEND DATA
    // =======================
    const timestamp = new Date().toISOString();
    const now = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const values = [[
      timestamp,
      now,
      platform,
      source,
      ua.substring(0, 200),
      "INSTALLED",
      ip,
    ]];

    const result = await appendWithRetry(
      sheets,
      SHEET_ID,
      `${SHEET_NAME}!A:G`,
      values
    );

    console.log(`✅ PWA Install tracked: ${platform} | row ${result.data.updates?.updatedRange}`);

    return NextResponse.json({
      ok: true,
      message: "PWA install tracked successfully",
    });
  } catch (err: any) {
    console.error("❌ PWA INSTALL ERROR:", err);

    return NextResponse.json(
      {
        ok: false,
        message: err?.message || "Failed to track PWA install",
      },
      { status: 500 }
    );
  }
}
