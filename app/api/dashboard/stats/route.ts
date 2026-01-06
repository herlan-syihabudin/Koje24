import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

function parseTanggalToDate(tanggalRaw: string) {
  if (!tanggalRaw) return null;

  const datePart = String(tanggalRaw).split(",")[0]?.trim();
  const parts = datePart.split("/");

  if (parts.length !== 3) return null;

  const d = Number(parts[0]);
  const m = Number(parts[1]);
  const y = Number(parts[2]);

  if (!d || !m || !y) return null;

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

    let todayOrders = 0;
    let monthOrders = 0;
    let totalRevenue = 0;

    for (const row of rows) {
      const tanggalRaw = row[1]; // B
      const totalBayarRaw = row[9]; // J
      const status = row[12]; // M

      if (!tanggalRaw || status !== "PAID") continue;

      const dt = parseTanggalToDate(tanggalRaw);
      if (!dt) continue;

      const totalBayar = Number(
        String(totalBayarRaw || "0").replace(/[^0-9]/g, "")
      );

      if (
        dt.getFullYear() === now.getFullYear() &&
        dt.getMonth() === now.getMonth()
      ) {
        monthOrders++;
        totalRevenue += totalBayar;

        if (dt.getDate() === now.getDate()) {
          todayOrders++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      todayOrders,
      monthOrders,
      totalRevenue,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
