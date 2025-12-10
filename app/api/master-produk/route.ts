import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    // 🔥 Pakai ENV lama yang sudah berjalan aman
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
    const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
    const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";

    if (!CLIENT_EMAIL || !PRIVATE_KEY_RAW || !SHEET_ID) {
      console.error("MASTER PRODUK ERROR: Missing environment variables");
      return NextResponse.json([]);
    }

    // Format private key
    const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 🔥 Range sheet sesuai database
    const range = "Master Produk!A2:F";

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range
    });

    const rows = res.data.values || [];

    // 🔥 Map produk aktif saja (kolom F = TRUE)
    const products = rows
      .filter((r) => String(r[5] || "").toLowerCase() === "true")
      .map((r) => ({
        kode: r[0] || "",
        nama: r[1] || "",
        harga: Number(String(r[2]).replace(/\D/g, "")) || 0,
        promo: Number(String(r[3]).replace(/\D/g, "")) || 0,
        img: r[4] || "",
      }));

    return NextResponse.json(products);
  } catch (err: any) {
    console.error("MASTER PRODUK ERROR:", err?.message ?? err);
    return NextResponse.json([]);
  }
}
