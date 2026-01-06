import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:O",
    });

    const rows = res.data.values || [];

    let codAmount = 0;
    let transferAmount = 0;

    rows.forEach((row) => {
      const total = Number(row[9] || 0);     // Total Bayar
      const metode = String(row[11] || "").toUpperCase(); // Metode
      const status = row[12];               // Status

      if (status !== "PAID") return;

      if (metode.includes("COD")) {
        codAmount += total;
      } else {
        transferAmount += total;
      }
    });

    return NextResponse.json({
      success: true,
      data: [
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
