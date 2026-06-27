// app/api/dashboard/sales-chart/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

/* =====================
   HELPERS
===================== */
function parseDate(raw: string): Date | null {
  if (!raw) return null;
  const datePart = raw.split(",")[0];
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function normalizeStatus(s: any) {
  return String(s || "").trim().toUpperCase();
}

/* =====================
   SALES CHART
===================== */
export async function GET(req: NextRequest) {
  try {
    // ✅ GUARD ADMIN
    const guard = await requireAdminFromRequest(req);
    if (!guard.ok) return guard.res;

    const { searchParams } = new URL(req.url);
    const modeRaw = searchParams.get("mode") || "daily";

    const mode =
      modeRaw === "daily" || modeRaw === "weekly" || modeRaw === "monthly"
        ? modeRaw
        : "daily";

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    const map = new Map<string, number>();

    // ✅ Status yang dihitung
    const validStatuses = ["PAID", "SELESAI", "COD"];

    rows.forEach((row) => {
      const tanggalRaw = row[1];        // B
      const totalBayar = Number(row[9] || 0); // J
      const status = normalizeStatus(row[12]); // M

      // ✅ Cek status valid
      if (!validStatuses.includes(status)) return;

      const dt = parseDate(tanggalRaw);
      if (!dt) return;

      let key = "";

      // 📅 DAILY
      if (mode === "daily") {
        key = dt.toISOString().slice(0, 10); // YYYY-MM-DD
      }

      // 📆 WEEKLY (Senin)
      if (mode === "weekly") {
        const monday = new Date(dt);
        const day = monday.getDay(); // 0=Sunday, 1=Monday
        const diff = day === 0 ? 6 : day - 1; // Monday = 0
        monday.setDate(monday.getDate() - diff);
        key = monday.toISOString().slice(0, 10);
      }

      // 🗓 MONTHLY
      if (mode === "monthly") {
        key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      }

      map.set(key, (map.get(key) || 0) + totalBayar);
    });

    // Sort data
    const data = Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, total]) => ({
        label,
        total,
      }));

    console.log(`📊 Sales chart [${mode}]: ${data.length} data points`);

    return NextResponse.json({
      success: true,
      mode,
      data,
    });
  } catch (e: any) {
    console.error("❌ chart error:", e);
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
