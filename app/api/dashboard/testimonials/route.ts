import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

export async function GET(req: NextRequest) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Testimoni!A2:H",
    });

    const rows = res.data.values || [];
    const testimonials = rows.map((row) => ({
      id: row[0],
      nama: row[1],
      kota: row[2],
      pesan: row[3],
      rating: Number(row[4]),
      varian: row[5],
      img: row[6],
      aktif: row[7]?.toLowerCase() === "true",
    }));

    return NextResponse.json({ success: true, testimonials });
  } catch (error) {
    return NextResponse.json({ success: false, testimonials: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const { id, aktif } = await req.json();

    // Cari baris dengan id tersebut
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Testimoni!A2:H",
    });

    const rows = res.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ success: false, message: "Testimoni tidak ditemukan" });
    }

    const sheetRow = rowIndex + 2;

    // Update status aktif di kolom H
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Testimoni!H${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[aktif ? "TRUE" : "FALSE"]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
