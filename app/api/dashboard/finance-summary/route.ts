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
      const metode = String(row[11] || "").toUpperCase(); // kolom L
      const status = row[12]; // kolom M
      const total = Number(row[9] || 0); // kolom J

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
      totalRevenue,
      transfer: {
        count: transferCount,
        amount: transferAmount,
      },
      cod: {
        count: codCount,
        amount: codAmount,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
