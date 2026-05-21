// app/api/master-produk/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
    const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
    const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";

    const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: CLIENT_EMAIL, private_key: PRIVATE_KEY },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 🔥 UBAH: pake sheet "Produk" (A:J)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Produk!A2:J", // ← UBAH INI!
    });

    const rows = res.data.values ?? [];

    const products = rows
      .filter((r) => r[6] && r[6].toString().toUpperCase() === "YES") // aktif=YES
      .map((r) => ({
        id: r[0] ?? "",        // A: id
        slug: r[1] ?? "",      // B: slug
        nama: r[2] ?? "",      // C: nama
        kategori: r[3] ?? "",  // D: kategori
        harga: Number(r[4]) || 0, // E: harga
        stok: Number(r[5]) || 0,  // F: stok
        aktif: r[6] ?? "",      // G: aktif
        img: r[7] ?? "",        // H: thumbnail
      }));

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (err: any) {
    console.error("API MASTER PRODUK ERROR:", err);
    return NextResponse.json({ success: false, products: [], message: err.message }, { status: 500 });
  }
}
