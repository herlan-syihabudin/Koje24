// app/api/master-produk/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
    const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
    const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";

    // Fix newline
    const PRIVATE_KEY = PRIVATE_KEY_RAW
      .replace(/\\n/g, "\n")
      .replace(/\\\\n/g, "\n");

    if (!CLIENT_EMAIL || !PRIVATE_KEY || !SHEET_ID) {
      throw new Error("Missing Google Sheet ENV");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Format sheet:
    // A:Kode | B:Nama | C:Harga | D:Promo | E:Gambar | F:Active (TRUE/FALSE)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Master Produk!A2:F",
    });

    const rows = res.data.values ?? [];

    const products = rows
      .filter((r) => r[5] && r[5].toString().toLowerCase() === "true") // hanya active=true
      .map((r) => ({
        kode: r[0] ?? "",
        nama: r[1] ?? "",
        harga: Number(r[2]) || 0,
        promo: Number(r[3]) || 0,
        img: r[4] ?? "",
      }));

    return NextResponse.json(products, { status: 200 });
  } catch (err: any) {
    console.error("API MASTER PRODUK ERROR:", err);
    return NextResponse.json([], { status: 200 }); // aman, tidak crash
  }
}
