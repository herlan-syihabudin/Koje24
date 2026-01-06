import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

function parseDate(raw: string): Date | null {
  if (!raw) return null;
  const datePart = raw.split(",")[0]; // "6/1/2026"
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "daily"; // daily | weekly | monthly

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:O",
    });

    const rows = res.data.values || [];
    const map = new Map<string, number>();

    rows.forEach((row) => {
      const tanggalRaw = row[1]; // B
      const totalBayar = Number(row[9] || 0); // J
      const status = row[12]; // M

      if (status !== "PAID") return;

      const dt = parseDate(tanggalRaw);
      if (!dt) return;

      let key = "";

      if (mode === "daily") {
        key = dt.toISOString().slice(0, 10); // YYYY-MM-DD
      }

      if (mode === "weekly") {
        const firstDay = new Date(dt);
        firstDay.setDate(dt.getDate() - dt.getDay());
        key = firstDay.toISOString().slice(0, 10);
      }

      if (mode === "monthly") {
        key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      }

      map.set(key, (map.get(key) || 0) + totalBayar);
    });

    const data = Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, total]) => ({
        label,
        total,
      }));

    return NextResponse.json({
      success: true,
      mode,
      data,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
