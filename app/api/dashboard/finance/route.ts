import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

/* =====================
   HELPERS
===================== */
function parseTanggal(raw: string) {
  if (!raw) return null;
  const datePart = String(raw).split(",")[0];
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function normalizeStatus(v: any) {
  return String(v || "").trim().toUpperCase();
}

function normalizeMethod(v: any) {
  const m = String(v || "").toUpperCase();
  if (m.includes("COD")) return "COD";
  if (m.includes("TRANSFER") || m.includes("QRIS")) return "TRANSFER";
  return "UNKNOWN";
}

function isDateInRange(date: Date, now: Date, period: string): boolean {
  if (period === "previous") {
    // Previous month: bulan lalu
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    return date >= lastMonth && date <= lastMonthEnd;
  }
  
  // Default "current": bulan ini
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return date >= startOfMonth;
}

/* =====================
   DASHBOARD INSIGHT
===================== */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "current"; // 'current' or 'previous'

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
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
      const tanggal = row[1];        // B
      const produkRaw = row[5];      // F
      const qty = Number(row[6] || 0); // G
      const total = Number(row[9] || 0); // J
      const metode = normalizeMethod(row[11]); // METODE BAYAR
      const status = normalizeStatus(row[12]); // STATUS

      if (status !== "PAID") return;

      const dt = parseTanggal(tanggal);
      if (!dt) return;

      // 🔥 FILTER BERDASARKAN PERIOD
      if (!isDateInRange(dt, now, period)) return;

      const dateKey = dt.toISOString().slice(0, 10);

      totalRevenue += total;
      revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + total;

      if (metode === "COD") codAmount += total;
      if (metode === "TRANSFER") transferAmount += total;

      if (produkRaw) {
        const name = String(produkRaw).replace(/\(.*?\)/g, "").trim();
        productQty[name] = (productQty[name] || 0) + qty;
        productRevenue[name] = (productRevenue[name] || 0) + total;
      }
    });

    /* =====================
       INSIGHTS (hanya untuk current period)
    ===================== */
    let insights = null;

    if (period === "current") {
      const getRangeSum = (from: number, to: number) => {
        let sum = 0;
        for (let i = from; i <= to; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          sum += revenueByDate[key] || 0;
        }
        return sum;
      };

      const last7 = getRangeSum(0, 6);
      const prev7 = getRangeSum(7, 13);

      let revenuePercent = 0;
      let revenueStatus: "up" | "down" | "flat" = "flat";

      if (prev7 === 0 && last7 > 0) {
        revenuePercent = 100;
        revenueStatus = "up";
      } else if (prev7 > 0) {
        revenuePercent = Math.round(((last7 - prev7) / prev7) * 100);
        revenueStatus =
          revenuePercent > 3 ? "up" :
          revenuePercent < -3 ? "down" : "flat";
      }

      const topProduct =
        Object.entries(productQty).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      const topProductContribution =
        topProduct && totalRevenue > 0
          ? Math.round((productRevenue[topProduct] / totalRevenue) * 100)
          : 0;

      const codRatio =
        totalRevenue > 0
          ? Math.round((codAmount / totalRevenue) * 100)
          : 0;

      insights = {
        revenueTrend: {
          percent: revenuePercent,
          status: revenueStatus,
        },
        topProduct: {
          name: topProduct,
          contribution: topProductContribution,
        },
        paymentRisk: {
          codRatio,
          warning: codRatio > 80,
        },
      };
    }

    return NextResponse.json({
      success: true,
      period,
      summary: {
        totalRevenue,
      },
      methods: {
        transfer: { amount: transferAmount },
        cod: { amount: codAmount },
      },
      chart: [
        { name: "Transfer / QRIS", value: transferAmount, count: 0 },
        { name: "COD", value: codAmount, count: 0 },
      ],
      ...(insights && { insights }),
    });
  } catch (err: any) {
    console.error("Finance API error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
