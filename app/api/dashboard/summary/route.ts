import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

/* =====================
   UTIL
===================== */
function getTodayString() {
  const now = new Date();
  return (
    String(now.getDate()).padStart(2, "0") +
    "/" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "/" +
    now.getFullYear()
  );
}

function getMonthString() {
  const now = new Date();
  return (
    "/" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "/" +
    now.getFullYear()
  );
}

/* =====================
   DASHBOARD SUMMARY
===================== */
export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P", // ambil sampai kolom CLOSED
    });

    const rows = res.data.values || [];

    const today = getTodayString();
    const month = getMonthString();

    let todayOrders = 0;
    let monthOrders = 0;

    let grossRevenue = 0;   // semua order bulan ini
    let netRevenue = 0;     // PAID / DIKIRIM / SELESAI
    let pendingRevenue = 0;

    let paidOrders = 0;
    let pendingOrders = 0;
    let cancelOrders = 0;

    rows.forEach((row) => {
      const tanggal = String(row[1] || "");        // B
      const totalBayar = Number(row[9] || 0);      // J
      const status = String(row[12] || "").toUpperCase(); // M
      const closed = String(row[15] || "").toUpperCase(); // P

      if (!tanggal) return;

      // =====================
      // ORDER HARI INI
      // =====================
      if (tanggal.startsWith(today)) {
        todayOrders++;
      }

      // =====================
      // ORDER BULAN INI
      // =====================
      if (tanggal.includes(month)) {
        monthOrders++;
        grossRevenue += totalBayar;

        if (["PAID", "DIKIRIM", "SELESAI"].includes(status)) {
          netRevenue += totalBayar;
          paidOrders++;
        } else if (status === "PENDING") {
          pendingRevenue += totalBayar;
          pendingOrders++;
        } else if (status === "CANCEL") {
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
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
