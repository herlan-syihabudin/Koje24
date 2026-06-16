// app/api/dashboard/login/route.ts

import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createSession, getMaxAgeSec, COOKIE_NAME } from "@/lib/dashboardAuth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // 🔥 AMBIL DATA ADMIN DARI GOOGLE SHEETS
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY;
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;

    if (!CLIENT_EMAIL || !PRIVATE_KEY_RAW || !SHEET_ID) {
      console.error("❌ Google Sheets credentials missing");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
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

    // 🔥 BACA SHEET ADMIN
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Admin!A:D", // Email, Password, Role, Active
    });

    const rows = res.data.values || [];

    // 🔥 Cari admin dengan email & password yang cocok
    const admin = rows.find((row) => {
      const adminEmail = row[0]?.trim().toLowerCase();
      const adminPassword = row[1]?.trim();
      const active = row[3]?.trim().toUpperCase() === "TRUE";
      return adminEmail === email.toLowerCase() && adminPassword === password && active;
    });

    if (!admin) {
      console.warn(`⚠️ Failed login attempt: ${email}`);
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // ✅ Buat session
    const role = admin[2]?.trim() || "staff";
    const token = createSession(email.toLowerCase(), role);

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      role,
    });

    // ✅ Set cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getMaxAgeSec(),
    });

    console.log(`✅ Admin logged in: ${email} (${role})`);
    return response;

  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
