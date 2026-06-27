import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

/* =====================
   UTIL
===================== */
function parseTanggal(raw: string) {
  if (!raw) return null;
  const datePart = raw.split(",")[0]; // "12/1/2026"
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;

  return {
    dayKey: `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`,
    monthKey: `/${String(m).padStart(2, "0")}/${y}`,
  };
}

function normalizeStatus(s: string) {
  const t = String(s || "").trim().toUpperCase();
  if (t === "PAID") return "PAID";
  if (t === "PENDING") return "PENDING";
  if (t === "CANCELLED" || t === "CANCEL") return "CANCELLED";
  return "OTHER";
}

/* =====================
   DASHBOARD SUMMARY
===================== */
export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];

    const now = new Date();
    const todayKey =
      String(now.getDate()).padStart(2, "0") +
      "/" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "/" +
      now.getFullYear();

    const monthKey =
      "/" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "/" +
      now.getFullYear();

    let todayOrders = 0;
    let monthOrders = 0;

    let grossRevenue = 0;
    let netRevenue = 0;
    let pendingRevenue = 0;

    let paidOrders = 0;
    let pendingOrders = 0;
    let cancelOrders = 0;

    rows.forEach((row) => {
      const tanggalRaw = String(row[1] || "");
      const totalBayar = Number(row[9] || 0);
      const status = normalizeStatus(row[12]);

      const parsed = parseTanggal(tanggalRaw);
      if (!parsed) return;

      // =====================
      // ORDER HARI INI
      // =====================
      if (parsed.dayKey === todayKey) {
        todayOrders++;
      }

      // =====================
      // ORDER BULAN INI
      // =====================
      if (parsed.monthKey === monthKey) {
        monthOrders++;
        grossRevenue += totalBayar;

        if (status === "PAID") {
          netRevenue += totalBayar;
          paidOrders++;
        } else if (status === "PENDING") {
          pendingRevenue += totalBayar;
          pendingOrders++;
        } else if (status === "CANCELLED") {
          cancelOrders++;
        }
      }
    });

    return NextResponse.json({
      success: true,

      // order
      todayOrders,
      monthOrders,
      paidOrders,
      pendingOrders,
      cancelOrders,

      // uang
      grossRevenue,
      netRevenue,
      pendingRevenue,
    });
  } catch (error: any) {
    console.error("DASHBOARD SUMMARY ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
