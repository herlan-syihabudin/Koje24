// app/api/dashboard/orders/export/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

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
   EXPORT EXCEL (CLOSED ONLY)
===================== */
export async function POST(req: NextRequest) {
  try {
    // ✅ GUARD ADMIN
    const guard = await requireAdminFromRequest(req);
    if (!guard.ok) return guard.res;

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
    end.setHours(23, 59, 59, 999);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    const exportRows: any[] = [];

    rows.forEach((row) => {
      const invoice = row[0];
      const tanggalRaw = row[1];
      const nama = row[4];
      const produk = row[5];
      const qty = Number(row[6] || 0);
      const total = Number(row[9] || 0);
      const metode = row[11];
      const rowStatus = String(row[12] || "").toUpperCase();
      const closed = String(row[15] || "").toUpperCase();

      if (!invoice) return;
      if (closed !== "YES") return;
      if (rowStatus !== cleanStatus) return;

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

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Closing Order");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const filename = `Closing_${cleanStatus}_${from}_to_${to}.xlsx`;

    console.log(`✅ Export ${exportRows.length} orders by ${guard.admin?.email}`);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("❌ Export error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
