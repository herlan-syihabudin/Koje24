import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const status = (searchParams.get("status") || "ALL").toUpperCase();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(
      100,
      Math.max(5, Number(searchParams.get("limit") || 25))
    );

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P", // ⬅️ WAJIB SAMPAI KOLOM P
    });

    const rows = res.data.values || [];

    const allOrders = rows
      .map((row) => {
        const invoice = String(row[0] || "").trim(); // A
        if (!invoice) return null;

        const tanggal = String(row[1] || "").trim(); // B
        const nama = String(row[2] || "").trim(); // C
        const produk = String(row[5] || "").trim(); // F
        const qty = Number(row[6] || 0); // G
        const totalBayar = Number(row[9] || 0); // J
        const metode = String(row[11] || "").trim(); // L
        const statusRow = String(row[12] || "").toUpperCase().trim(); // M
        const closed = String(row[15] || "").toUpperCase().trim(); // P

        // 🔴 INI KUNCI STEP 1
        if (closed === "YES") return null;

        return {
          invoice,
          tanggal,
          nama,
          produk,
          qty,
          totalBayar,
          metode,
          status: statusRow || "PENDING",
        };
      })
      .filter(Boolean) as any[];

    // filter status tab
    const filtered =
      status === "ALL"
        ? allOrders
        : allOrders.filter((o) => o.status === status);

    // sort terbaru di atas
    filtered.sort((a, b) =>
      (b.tanggal || "").localeCompare(a.tanggal || "")
    );

    // pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const end = start + limit;

    const orders = filtered.slice(start, end);

    return NextResponse.json({
      success: true,
      meta: {
        status,
        page: safePage,
        limit,
        total,
        totalPages,
      },
      orders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
