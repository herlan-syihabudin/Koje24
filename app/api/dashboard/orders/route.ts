import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

function parseTanggal(raw: string) {
  if (!raw) return null;
  const datePart = String(raw).split(",")[0].trim();
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

export async function GET(req: NextRequest) {
  const guard = requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const { searchParams } = new URL(req.url);

    const status = (searchParams.get("status") || "ALL").toUpperCase();
    const closed = (searchParams.get("closed") || "NO").toUpperCase();

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(5, Number(searchParams.get("limit") || 25)));

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];

    let orders = rows
      .map((row) => {
        const invoice = String(row[0] || "").trim();
        if (!invoice) return null;

        return {
          invoice,
          tanggal: row[1],
          nama: row[2],
          produk: row[5],
          qty: Number(row[6] || 0),
          totalBayar: Number(row[9] || 0),
          status: String(row[12] || "PENDING").toUpperCase(),
          closed: String(row[15] || "").toUpperCase() === "YES" ? "YES" : "NO",
          _dt: parseTanggal(row[1])?.getTime() || 0,
        };
      })
      .filter(Boolean) as any[];

    if (status !== "ALL") orders = orders.filter(o => o.status === status);
    if (closed !== "ALL") orders = orders.filter(o => o.closed === closed);

    orders.sort((a, b) => b._dt - a._dt);

    const total = orders.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);

    const start = (safePage - 1) * limit;
    const data = orders.slice(start, start + limit).map(({ _dt, ...o }) => o);

    return NextResponse.json({
      success: true,
      meta: { status, closed, page: safePage, limit, total, totalPages },
      orders: data,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
