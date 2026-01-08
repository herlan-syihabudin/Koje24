import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import * as XLSX from "xlsx";

/* =====================
   RUNTIME (WAJIB)
===================== */
export const runtime = "nodejs";

/* =====================
   UTIL
===================== */
function parseTanggal(tanggalRaw: string) {
  if (!tanggalRaw) return null;

  // support: "dd/mm/yyyy" atau "dd/mm/yyyy, hh:mm"
  const datePart = String(tanggalRaw).split(",")[0];
  const [d, m, y] = datePart.split("/").map(Number);

  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function formatDateISO(d: Date) {
  return d.toISOString().split("T")[0];
}

/* =====================
   EXPORT EXCEL (CLOSED ONLY)
===================== */
export async function POST(req: Request) {
  try {
    const { from, to, status } = await req.json();

    if (!from || !to || !status) {
      return NextResponse.json(
        { success: false, message: "Parameter tidak lengkap" },
        { status: 400 }
      );
    }

    const cleanStatus = String(status).toUpperCase().trim();

    const start = new Date(from);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999); // ⏱️ INCLUDE HARI TERAKHIR

    /* =====================
       AMBIL DATA (SAMPAI P)
    ===================== */
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    const exportRows: any[] = [];

    rows.forEach((row) => {
      const invoice = row[0];          // A
      const tanggalRaw = row[1];       // B
      const nama = row[4];             // E
      const produk = row[5];           // F
      const qty = Number(row[6] || 0); // G
      const total = Number(row[9] || 0); // J
      const metode = row[11];          // L
      const rowStatus = String(row[12] || "").toUpperCase(); // M
      const closed = String(row[15] || "").toUpperCase();    // P 🔒

      if (!invoice) return;
      if (closed !== "YES") return;          // 🔒 WAJIB CLOSED
      if (rowStatus !== cleanStatus) return; // filter status

      const dt = parseTanggal(tanggalRaw);
      if (!dt) return;
      if (dt < start || dt > end) return;

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
        {
          success: false,
          message: "Tidak ada data CLOSED yang bisa diexport",
        },
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

    const filename = `Closing_${cleanStatus}_${from}_to_${to}.xlsx`;

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
