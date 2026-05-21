import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

function parseTanggal(raw: string): string {
  if (!raw) return "";
  const datePart = raw.split(",")[0];
  return datePart;
}

// 🔥 PARAMS HARUS PROMISE (Next.js 15)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const { id } = await params; // 🔥 AWAIT PARAMS
    const email = decodeURIComponent(id);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    const orders = rows
      .filter((row) => row[14]?.trim().toLowerCase() === email.toLowerCase())
      .map((row) => ({
        invoice: row[0],
        tanggal: parseTanggal(row[1]),
        total: Number(row[9]) || 0,
        status: row[12],
      }))
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Customer orders error:", error);
    return NextResponse.json({ success: false, orders: [] });
  }
}
