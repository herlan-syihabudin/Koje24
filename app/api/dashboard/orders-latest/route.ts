import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

function parseTanggal(tanggalRaw: string) {
  if (!tanggalRaw) return null;
  const datePart = String(tanggalRaw).split(",")[0]?.trim();
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function formatTanggal(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P", // 🔥 FIX: sampai kolom P
    });

    const rows = res.data.values || [];

    const orders = rows
      .map((row) => {
        const tanggal = parseTanggal(row[1]);
        if (!tanggal) return null;
        
        return {
          invoice: row[0],
          tanggal: formatTanggal(tanggal),
          tanggalRaw: row[1],
          nama: row[2],
          produk: row[5],
          qty: Number(row[6] || 0),
          totalBayar: Number(row[9] || 0),
          metodeBayar: row[11],
          status: row[12],
        };
      })
      .filter((o) => o && o.status === "PAID")
      .sort((a, b) => {
        const dateA = parseTanggal(a!.tanggalRaw);
        const dateB = parseTanggal(b!.tanggalRaw);
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      })
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error("Orders latest error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memuat data" },
      { status: 500 }
    );
  }
}
