// app/api/dashboard/promos/route.ts

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
  try {
    const guard = await requireAdminFromRequest(req);
    if (!guard.ok) return guard.res;

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Kode Promo!A2:H", // 🔥 Tambah H
    });

    const rows: any[] = res.data.values ?? [];

    const promos = rows
      .filter((r) => r && r.length > 0 && r[0]?.trim())
      .map((r) => {
        const rawStatus = (r[5] ?? "").trim().toLowerCase();
        const status = ["active", "inactive", "expired"].includes(rawStatus) 
          ? rawStatus 
          : "inactive";

        return {
          kode: (r[0] ?? "").trim().toUpperCase(),
          tipe: (r[1] ?? "").trim(),
          nilai: toNumber(r[2]),
          minimal: toNumber(r[3]),
          maxDiskon: r[4] && r[4] !== "-" ? toNumber(r[4]) : null,
          status,
          expired: r[6] ?? "",
          // 🔥 Tambah kolom H (description) kalau ada
          description: r[7] ? (r[7] ?? "").trim() : "",
        };
      });

    console.log(`✅ ${promos.length} promos fetched by: ${guard.admin?.email || "unknown"}`);

    return NextResponse.json({ 
      success: true, 
      promos,
      total: promos.length,
    });
  } catch (err: any) {
    console.error("❌ API DASHBOARD PROMOS ERROR:", err);
    return NextResponse.json(
      { 
        success: false, 
        promos: [], 
        message: err?.message || "Failed to fetch promos" 
      },
      { status: 500 }
    );
  }
}
