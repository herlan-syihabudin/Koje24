// lib/requireAdminFromRequest.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, getCookieName } from "@/lib/dashboardAuth";
import { google } from "googleapis";

type GuardFail = {
  ok: false;
  res: NextResponse;
};

type GuardSuccess = {
  ok: true;
  admin: {
    email: string;
    role: string;
  };
};

export type AdminGuardResult = GuardFail | GuardSuccess;

// 🔥 Cache admins dari Google Sheets (refresh tiap 5 menit)
let cachedAdmins: { email: string; role: string; active: boolean }[] = [];
let cacheTimestamp = 0;

async function getAdminsFromSheets(): Promise<{ email: string; role: string; active: boolean }[]> {
  const now = Date.now();
  
  // Cache 5 menit
  if (cachedAdmins.length > 0 && now - cacheTimestamp < 5 * 60 * 1000) {
    return cachedAdmins;
  }

  try {
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY;
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;

    if (!CLIENT_EMAIL || !PRIVATE_KEY_RAW || !SHEET_ID) {
      console.warn("⚠️ Google Sheets credentials missing, fallback to ENV");
      // Fallback ke ENV
      const emails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      return emails.map((email) => ({ email, role: "admin", active: true }));
    }

    const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").trim();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Admin!A:D", // Email, Password, Role, Active
    });

    const rows = res.data.values || [];

    cachedAdmins = rows
      .filter((row) => row[3]?.trim().toUpperCase() === "TRUE") // Active
      .map((row) => ({
        email: row[0]?.trim().toLowerCase() || "",
        role: row[2]?.trim() || "staff",
        active: true,
      }))
      .filter((admin) => admin.email);

    cacheTimestamp = now;

    return cachedAdmins;
  } catch (error) {
    console.error("❌ Failed to fetch admins from Sheets:", error);
    // Fallback ke ENV
    const emails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return emails.map((email) => ({ email, role: "admin", active: true }));
  }
}

export async function requireAdminFromRequest(
  req: NextRequest
): Promise<AdminGuardResult> {
  try {
    const raw = req.cookies.get(getCookieName())?.value;
    const payload = verifySession(raw);

    if (!payload) {
      console.warn(`⚠️ Unauthorized: No valid session`);
      return {
        ok: false,
        res: NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 }
        ),
      };
    }

    // 🔥 Ambil admin dari Google Sheets (cache)
    const admins = await getAdminsFromSheets();

    const admin = admins.find(
      (a) => a.email === payload.email.toLowerCase() && a.active === true
    );

    if (!admin) {
      console.warn(`⚠️ Forbidden: ${payload.email} not in admin list`);
      return {
        ok: false,
        res: NextResponse.json(
          { message: "Forbidden" },
          { status: 403 }
        ),
      };
    }

    return {
      ok: true,
      admin: {
        email: admin.email,
        role: admin.role,
      },
    };
  } catch (error) {
    console.error("❌ requireAdminFromRequest error:", error);
    return {
      ok: false,
      res: NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      ),
    };
  }
}
