import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

function parseTanggal(tanggalRaw: string) {
  if (!tanggalRaw) return null;
  const datePart = String(tanggalRaw).split(",")[0];
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:O",
    });

    const rows = res.data.values || [];
    const now = new Date();

    let totalRevenue = 0;
    let codAmount = 0;
    let transferAmount = 0;

    const revenueByDate: Record<string, number> = {};
    const productQty: Record<string, number> = {};
    const productRevenue: Record<string, number> = {};

    rows.forEach((row) => {
      const tanggal = row[1];
      const produkRaw = row[5];
      const qty = Number(row[6] || 0);
      const total = Number(row[9] || 0);
      const metode = String(row[11] || "").toUpperCase();
      const status = String(row[12] || "").toUpperCase();

      if (status !== "PAID") return;

      const dt = parseTanggal(tanggal);
      if (!dt) return;

      const dateKey = dt.toISOString().slice(0, 10);

      totalRevenue += total;
      revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + total;

      if (metode.includes("COD")) codAmount += total;
      else transferAmount += total;

      if (produkRaw) {
        const name = produkRaw.replace(/\(.*?\)/g, "").trim();
        productQty[name] = (productQty[name] || 0) + qty;
        productRevenue[name] = (productRevenue[name] || 0) + total;
      }
    });

    /* =====================
       INSIGHT LOGIC
    ===================== */

    // 1️⃣ Revenue trend (7 hari vs 7 hari sebelumnya)
    const getRangeSum = (offsetStart: number, offsetEnd: number) => {
      let sum = 0;
      for (let i = offsetStart; i <= offsetEnd; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        sum += revenueByDate[key] || 0;
      }
      return sum;
    };

    const last7 = getRangeSum(0, 6);
    const prev7 = getRangeSum(7, 13);

    const revenuePercent =
      prev7 === 0 ? 0 : Math.round(((last7 - prev7) / prev7) * 100);

    const revenueStatus =
      revenuePercent > 3 ? "up" : revenuePercent < -3 ? "down" : "flat";

    // 2️⃣ Produk terlaris (berdasarkan QTY)
    const topProductName =
      Object.entries(productQty).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const topProductContribution = topProductName
      ? Math.round(
          (productRevenue[topProductName] / totalRevenue) * 100
        )
      : 0;

    // 3️⃣ Risiko metode pembayaran
    const codRatio =
      totalRevenue === 0
        ? 0
        : Math.round((codAmount / totalRevenue) * 100);

    return NextResponse.json({
      success: true,

      summary: {
        totalRevenue,
      },

      methods: {
        transfer: {
          amount: transferAmount,
        },
        cod: {
          amount: codAmount,
        },
      },

      chart: [
        { name: "Transfer / QRIS", value: transferAmount },
        { name: "COD", value: codAmount },
      ],

      insights: {
        revenueTrend: {
          percent: revenuePercent,
          status: revenueStatus, // up | down | flat
        },
        topProduct: {
          name: topProductName,
          contribution: topProductContribution,
        },
        paymentRisk: {
          codRatio,
          warning: codRatio > 80,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
