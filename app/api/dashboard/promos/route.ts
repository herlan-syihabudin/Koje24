import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

const toNumber = (v: string | null | undefined): number => {
  if (!v) return 0;
  const t = String(v).trim();
  if (t.includes("%")) return Number(t.replace("%", ""));
  return Number(t.replace(/\D/g, "")) || 0;
};

export async function GET(req: NextRequest) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Kode Promo!A2:G",
    });

    const rows: any[] = res.data.values ?? [];

    const promos = rows
      .filter((r) => r && r.length > 0)
      .map((r) => ({
        kode: (r[0] ?? "").trim().toUpperCase(),
        tipe: (r[1] ?? "").trim(),
        nilai: toNumber(r[2]),
        minimal: toNumber(r[3]),
        maxDiskon: r[4] && r[4] !== "-" ? toNumber(r[4]) : null,
        status: (r[5] ?? "").trim().toLowerCase(),
        expired: r[6] ?? "",
      }));

    // Return semua promo (aktif + nonaktif)
    return NextResponse.json({ success: true, promos });
  } catch (err: any) {
    console.error("API DASHBOARD PROMOS ERROR:", err?.message ?? err);
    return NextResponse.json({ success: false, promos: [] });
  }
}
