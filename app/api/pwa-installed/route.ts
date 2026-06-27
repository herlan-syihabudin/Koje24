// app/api/pwa-installed/route.ts

import { NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SHEET_NAME = "PWA_INSTALL";

// 🔥 CACHE AUTH
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

// 🔥 DETEKSI IP
function getClientIP(req: Request): string {
  const headers = req.headers;
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

// 🔥 RETRY LOGIC
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

export async function POST(req: Request) {
  try {
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;
    if (!SHEET_ID) {
      console.error("❌ Google Sheets ID missing");
      return NextResponse.json(
        { ok: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

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

    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

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
