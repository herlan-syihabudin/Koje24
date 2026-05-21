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

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Produk!A2:P",
    });

    const rows = res.data.values ?? [];

    const parseJSONArray = (str: string) => {
      if (!str) return [];
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return str.split(",").map(s => s.trim()).filter(Boolean);
      }
    };

    const productsData = rows
      .filter((r) => r[6] && r[6].toString().toUpperCase() === "YES")
      .map((r) => {
        const kategori = r[3] ?? "";
        const nama = r[2] ?? "";
        
        // 🔥 Tentukan isPackage: berdasarkan kategori "Paket" atau nama mengandung "Paket"
        const isPackage = kategori === "Paket" || nama.toLowerCase().includes("paket");
        
        return {
          id: r[0] ?? "",
          slug: r[1] ?? "",
          nama: nama,
          kategori: kategori,
          harga: Number(r[4]) || 0,
          stok: Number(r[5]) || 0,
          aktif: r[6] ?? "",
          img: r[7] ?? "",
          updatedAt: r[8] ?? "",
          createdAt: r[9] ?? "",
          slogan: r[10] ?? "",
          ingredients: parseJSONArray(r[11]),
          benefits: parseJSONArray(r[12]),
          goodFor: parseJSONArray(r[13]),
          consumeTime: r[14] ?? "",
          desc: r[15] ?? "",
          isPackage: isPackage,  // 🔥 SEKARANG BENER
          brand: "KOJE24",
        };
      });

    return NextResponse.json({ success: true, products: productsData });
  } catch (err: any) {
    console.error("API MASTER PRODUK ERROR:", err);
    return NextResponse.json({ success: false, products: [], message: err.message }, { status: 500 });
  }
}
