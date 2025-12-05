import { NextResponse } from "next/server";
import { google } from "googleapis";

const toNumber = (v: string | null | undefined): number => {
  if (!v) return 0;
  const text = String(v).trim();
  if (text.includes("%")) return Number(text.replace("%", ""));
  return Number(text.replace(/\D/g, "")) || 0;
};

export async function GET() {
  try {
    const CLIENT_EMAIL = process.env.GS_CLIENT_EMAIL ?? "";
    const PRIVATE_KEY_RAW = process.env.GS_PRIVATE_KEY ?? "";
    const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n"); // → paling aman

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.GS_SHEET_ID ?? "";
    const range = "Kode Promo!A2:F"; // otomatis sampai baris terakhir

    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows: any[] = res.data.values ?? [];

    const promos = rows
      .filter((r) => r && r.length > 0) // skip baris kosong
      .map((r) => ({
        kode: (r[0] ?? "").trim().toUpperCase(),
        tipe: (r[1] ?? "").trim(), // Diskon / Potongan / Free Ongkir / Cashback
        nilai: toNumber(r[2]),
        minimal: toNumber(r[3]),
        maxDiskon: r[4] && r[4] !== "-" ? toNumber(r[4]) : null,
        status: (r[5] ?? "").trim().toLowerCase(),
      }))
      .filter((r) => r.status === "aktif"); // hanya aktif

    return NextResponse.json({
      success: true,
      promos,
      total: promos.length,
    });
  } catch (err: any) {
    console.error("API PROMOS ERROR:", err?.message ?? err);
    // ❗ Tidak bikin web crash → status 200
    return NextResponse.json({
      success: false,
      message: "PROMO tidak terbaca — periksa sheet atau credential",
      detail: err?.message ?? err,
    });
  }
}
