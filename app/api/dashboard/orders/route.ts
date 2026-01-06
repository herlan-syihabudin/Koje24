import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // optional

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:O",
    });

    const rows = res.data.values || [];

    const orders = rows
      .map((row, i) => ({
        rowIndex: i + 2,        // penting untuk update nanti
        invoice: row[0],
        tanggal: row[1],
        nama: row[2],
        hp: row[3],
        alamat: row[4],
        produk: row[5],
        qty: Number(row[6] || 0),
        totalBayar: Number(row[9] || 0),
        metode: row[11],
        status: row[12],
      }))
      .filter((o) =>
        statusFilter && statusFilter !== "ALL"
          ? o.status === statusFilter
          : true
      )
      .reverse(); // terbaru di atas

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
