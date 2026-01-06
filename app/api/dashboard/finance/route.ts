import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:O",
    });

    const rows = res.data.values || [];

    let totalRevenue = 0;

    let transferCount = 0;
    let transferAmount = 0;

    let codCount = 0;
    let codAmount = 0;

    rows.forEach((row) => {
      const total = Number(row[9] || 0);            // Total Bayar (J)
      const metode = String(row[11] || "").toUpperCase(); // Metode (L)
      const status = String(row[12] || "").toUpperCase(); // Status (M)

      if (status !== "PAID") return;

      totalRevenue += total;

      if (metode.includes("COD")) {
        codCount += 1;
        codAmount += total;
      } else {
        transferCount += 1;
        transferAmount += total;
      }
    });

    return NextResponse.json({
      success: true,

      summary: {
        totalRevenue,
        totalTransaction: transferCount + codCount,
      },

      methods: {
        transfer: {
          name: "Transfer / QRIS",
          count: transferCount,
          amount: transferAmount,
        },
        cod: {
          name: "COD",
          count: codCount,
          amount: codAmount,
        },
      },

      chart: [
        { name: "Transfer / QRIS", value: transferAmount },
        { name: "COD", value: codAmount },
      ],
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
