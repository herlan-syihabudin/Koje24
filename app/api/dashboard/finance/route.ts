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
      const total = Number(row[9] || 0);
      const metode = String(row[11] || "").toUpperCase();
      const status = String(row[12] || "").toUpperCase();

      if (status !== "PAID") return;

      totalRevenue += total;

      if (metode.includes("COD")) {
        codCount++;
        codAmount += total;
      } else {
        transferCount++;
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
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
