import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

export async function GET(req: Request) {
  const guard = requireAdmin();
  if (!guard.ok) return guard.res;

function parseTanggal(raw: string) {
  if (!raw) return null;

  // handle: "dd/mm/yyyy" atau "dd/mm/yyyy, hh:mm:ss"
  const datePart = String(raw).split(",")[0].trim();
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;

  return new Date(y, m - 1, d);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const status = (searchParams.get("status") || "ALL").toUpperCase();

    // ✅ filter closed:
    // default: NO (biar list kerjaan harian bersih)
    // values: NO | YES | ALL
    const closed = (searchParams.get("closed") || "NO").toUpperCase();

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(5, Number(searchParams.get("limit") || 25)));

    // ✅ ambil sampai kolom P biar dapet CLOSED
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];

    const allOrders = rows
      .map((row) => {
        const invoice = String(row[0] || "").trim();        // A
        const tanggalRaw = String(row[1] || "").trim();     // B
        const nama = String(row[2] || "").trim();           // C
        const produk = String(row[5] || "").trim();         // F
        const qty = Number(row[6] || 0);                    // G
        const totalBayar = Number(row[9] || 0);             // J
        const metode = String(row[11] || "").trim();        // L
        const st = String(row[12] || "").toUpperCase().trim(); // M
        const closedFlag = String(row[15] || "").toUpperCase().trim(); // P

        if (!invoice) return null;

        return {
          invoice,
          tanggal: tanggalRaw,
          nama,
          produk,
          qty,
          totalBayar,
          metode,
          status: st || "PENDING",
          closed: closedFlag === "YES" ? "YES" : "NO",
          _dt: parseTanggal(tanggalRaw)?.getTime() || 0,
        };
      })
      .filter(Boolean) as any[];

    // ✅ filter status
    let filtered = status === "ALL" ? allOrders : allOrders.filter((o) => o.status === status);

    // ✅ filter closed
    if (closed !== "ALL") {
      filtered = filtered.filter((o) => o.closed === closed);
    }

    // ✅ sort terbaru di atas (pakai tanggal beneran)
    filtered.sort((a, b) => (b._dt - a._dt) || String(b.invoice).localeCompare(String(a.invoice)));

    // ✅ pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const end = start + limit;

    const orders = filtered.slice(start, end).map(({ _dt, ...rest }) => rest);

    return NextResponse.json({
      success: true,
      meta: { status, closed, page: safePage, limit, total, totalPages },
      orders,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
