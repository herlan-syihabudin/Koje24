import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

function parseTanggalToDate(tanggalRaw: string) {
  // contoh di sheet: "6/1/2026, 01.29.49" atau "9/12/2025, 13.20.21"
  if (!tanggalRaw) return null;

  const datePart = String(tanggalRaw).split(",")[0]?.trim(); // "6/1/2026"
  const parts = datePart.split("/").map((x) => x.trim()); // ["6","1","2026"]
  if (parts.length !== 3) return null;

  const d = Number(parts[0]);
  const m = Number(parts[1]);
  const y = Number(parts[2]);

  if (!d || !m || !y) return null;

  // JS month 0-based
  return new Date(y, m - 1, d);
}

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:O",
    });

    const rows = res.data.values || [];

    const now = new Date();
    const thisMonth = now.getMonth(); // 0-based
    const thisYear = now.getFullYear();

    let todayOrders = 0;
    let monthOrders = 0;

    for (const row of rows) {
      const tanggalRaw = row[1]; // kolom B = Tanggal
      const status = row[12];    // kolom M = Status (sesuaikan kalau beda)

      if (!tanggalRaw) continue;

      const dt = parseTanggalToDate(tanggalRaw);
      if (!dt) continue;

      // kalau mau hanya PAID, aktifkan filter ini:
      // if (status !== "PAID") continue;

      // hitung bulan ini
      if (dt.getFullYear() === thisYear && dt.getMonth() === thisMonth) {
        monthOrders += 1;

        // hitung hari ini (bulan ini sekalian)
        const isToday =
          dt.getDate() === now.getDate() &&
          dt.getMonth() === now.getMonth() &&
          dt.getFullYear() === now.getFullYear();

        // optional: kalau hari ini harus PAID baru dihitung
        if (isToday) {
          // kalau kamu mau wajib PAID: if (status === "PAID") todayOrders++;
          todayOrders += 1;
        }
      }
    }

    return NextResponse.json({
      success: true,
      todayOrders,
      monthOrders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
