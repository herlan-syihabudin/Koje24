import { NextResponse } from "next/server";
import { google } from "googleapis";

// Convert angka—aman untuk Rp & %
const toNumber = (v: string | null | undefined): number => {
  if (!v) return 0;
  const t = String(v).trim();
  if (t.includes("%")) return Number(t.replace("%", ""));
  return Number(t.replace(/\D/g, "")) || 0;
};

export async function GET() {
  try {
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
    const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
    const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";

    // 🔥 Private key must be repaired
    const PRIVATE_KEY = PRIVATE_KEY_RAW
      .replace(/\\n/g, "\n")
      .replace(/\\\\n/g, "\n");

    if (!CLIENT_EMAIL || !PRIVATE_KEY || !SHEET_ID) {
      console.error("PROMO ERROR: Missing Google Sheet config");
      return NextResponse.json([]);
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const range = "Kode Promo!A2:F";
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    const rows: any[] = res.data.values ?? [];

    const promos = rows
      .filter((r) => r && r.length > 0)
      .map((r) => ({
        kode: (r[0] ?? "").trim().toUpperCase(),
        tipe: (r[1] ?? "").trim(), 
        nilai: toNumber(r[2]),
        minimal: toNumber(r[3]),
        maxDiskon: r[4] && r[4] !== "-" ? toNumber(r[4]) : null,
        status: (r[5] ?? "").trim().toLowerCase(),
      }))
      .filter((p) => p.status === "aktif");

    // FE expects array directly — not { success, promos }
    return NextResponse.json(promos, { status: 200 });

  } catch (err: any) {
    console.error("API PROMOS ERROR:", err?.message ?? err);
    return NextResponse.json([], { status: 200 });
  }
}
