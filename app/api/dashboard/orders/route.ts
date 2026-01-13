import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

/* =====================
   TYPES
===================== */
type OrderStatus =
  | "PENDING"
  | "PAID"
  | "COD"
  | "DIPROSES"
  | "DIKIRIM"
  | "SELESAI"
  | "CANCELLED";

type OrderRow = {
  invoice: string;
  tanggal: string;
  nama: string;
  produk: string;
  qty: number;
  totalBayar: number;
  status: OrderStatus;
  closed: "YES" | "NO";
  _dt: number;
};

/* =====================
   HELPERS
===================== */
function parseTanggal(raw: string): number {
  if (!raw) return 0;
  const datePart = raw.split(",")[0]; // "6/1/2026"
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return 0;
  return new Date(y, m - 1, d).getTime();
}

function normalizeStatus(s: any): OrderStatus {
  const t = String(s || "").trim().toUpperCase();

  if (t === "PAID") return "PAID";
  if (t === "COD") return "COD";
  if (t === "DIPROSES") return "DIPROSES";
  if (t === "DIKIRIM") return "DIKIRIM";
  if (t === "SELESAI") return "SELESAI";
  if (t === "CANCEL" || t === "CANCELLED") return "CANCELLED";

  return "PENDING";
}

/* =====================
   GET ORDERS
===================== */
export async function GET(req: NextRequest) {
  const guard = requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const { searchParams } = new URL(req.url);

    const status = (searchParams.get("status") || "ALL").toUpperCase();
    const closed = (searchParams.get("closed") || "ALL").toUpperCase();

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(5, Number(searchParams.get("limit") || 25)));

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];

    let orders: OrderRow[] = rows
      .map((row) => {
        const invoice = String(row[0] || "").trim();
        if (!invoice) return null;

        return {
          invoice,
          tanggal: String(row[1] || ""),
          nama: String(row[2] || ""),
          produk: String(row[5] || ""),
          qty: Number(row[6] || 0),
          totalBayar: Number(row[9] || 0),
          status: normalizeStatus(row[12]), // kolom M
          closed: String(row[15] || "").toUpperCase() === "YES" ? "YES" : "NO",
          _dt: parseTanggal(row[1]),
        };
      })
      .filter(Boolean) as OrderRow[];

    /* =====================
       FILTER
    ===================== */
    if (status !== "ALL") {
      orders = orders.filter((o) => o.status === status);
    }

    if (closed !== "ALL") {
      orders = orders.filter((o) => o.closed === closed);
    }

    /* =====================
       SORT TERBARU
    ===================== */
    orders.sort((a, b) => b._dt - a._dt);

    /* =====================
       PAGINATION
    ===================== */
    const total = orders.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);

    const start = (safePage - 1) * limit;
    const data = orders
      .slice(start, start + limit)
      .map(({ _dt, ...o }) => o);

    return NextResponse.json({
      success: true,
      meta: {
        status,
        closed,
        page: safePage,
        limit,
        total,
        totalPages,
      },
      orders: data,
    });
  } catch (err) {
    console.error("GET /dashboard/orders error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
