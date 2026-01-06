import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import * as XLSX from "xlsx";

/* =====================
   UTIL
===================== */
function parseTanggal(tanggalRaw: string) {
  if (!tanggalRaw) return null;
  const datePart = String(tanggalRaw).split(",")[0];
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function formatDateISO(d: Date) {
  return d.toISOString().split("T")[0];
}

/* =====================
   GET EXPORT
===================== */
export async function POST(req: Request) {
  try {
    const { startDate, endDate, status } = await req.json();

    if (!startDate || !endDate || !status) {
      return NextResponse.json(
        { success: false, message: "Parameter tidak lengkap" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:O",
    });

    const rows = res.data.values || [];
    const exportRows: any[] = [];

    rows.forEach((row) => {
      const tanggalRaw = row[1]; // B
      const invoice = row[0]; // A
      const nama = row[4]; // E
      const produk = row[5]; // F
      const qty = Number(row[6] || 0); // G
      const total = Number(row[9] || 0); // J
      const metode = row[11]; // L
      const rowStatus = row[12]; // M

      const dt = parseTanggal(tanggalRaw);
      if (!dt) return;

      if (dt < start || dt > end) return;
      if (rowStatus !== status) return;

      exportRows.push({
        Invoice: invoice,
        Tanggal: formatDateISO(dt),
        Nama: nama,
        Produk: produk,
        Qty: qty,
        Total: total,
        Metode: metode,
        Status: rowStatus,
      });
    });

    if (exportRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data untuk diexport" },
        { status: 404 }
      );
    }

    /* =====================
       GENERATE EXCEL
    ===================== */
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Closing Order");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const filename = `Closing_${status}_${startDate}_to_${endDate}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
