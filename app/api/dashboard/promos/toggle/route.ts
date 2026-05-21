import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

export async function POST(req: Request) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const { kode, status } = await req.json();

    // Cari baris promo dengan kode tersebut
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Kode Promo!A2:F",
    });

    const rows = res.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0]?.trim().toUpperCase() === kode.toUpperCase());

    if (rowIndex === -1) {
      return NextResponse.json({ success: false, message: "Promo tidak ditemukan" });
    }

    const sheetRow = rowIndex + 2; // +2 karena header di baris 1

    // Update status di kolom F
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Kode Promo!F${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[status]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toggle promo error:", error);
    return NextResponse.json({ success: false, message: "Gagal update status" });
  }
}
