import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

function parseTanggal(tanggalRaw: string) {
  if (!tanggalRaw) return null;
  const [d, m, y] = String(tanggalRaw).split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

export async function POST(req: Request) {
  try {
    const { from, to, status } = await req.json();

    if (!from || !to || !status) {
      return NextResponse.json(
        { success: false, message: "Parameter tidak lengkap" },
        { status: 400 }
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    const updates: any[] = [];

    rows.forEach((row, index) => {
      const tanggal = parseTanggal(row[1]); // B
      const orderStatus = row[12]; // M
      const closed = row[15]; // P

      if (!tanggal) return;
      if (closed === "YES") return;
      if (orderStatus !== status) return;

      if (tanggal >= fromDate && tanggal <= toDate) {
        updates.push({
          range: `Transaksi!P${index + 2}`,
          values: [["YES"]],
        });
      }
    });

    if (updates.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada data untuk di-closing",
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: "RAW",
        data: updates,
      },
    });

    return NextResponse.json({
      success: true,
      closedCount: updates.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
