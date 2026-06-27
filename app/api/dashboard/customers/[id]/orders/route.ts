// app/api/dashboard/customers/[id]/route.ts

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

function parseTanggal(raw: string): Date | null {
  if (!raw) return null;
  const datePart = raw.split(",")[0]; // "6/1/2026"
  const parts = datePart.split("/").map(Number);
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function formatTanggal(date: Date | null): string {
  if (!date) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// 🔥 PARAMS HARUS PROMISE (Next.js 15)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdminFromRequest(req);
    if (!guard.ok) return guard.res;

    const { id } = await params; // 🔥 AWAIT PARAMS
    const email = decodeURIComponent(id);

    // 🔥 Validasi email
    if (!email || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { success: false, message: "Email tidak valid" },
        { status: 400 }
      );
    }

    console.log(`📋 Customer orders fetched by: ${guard.admin?.email || "unknown"} for: ${email}`);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    
    // 🔥 Filter & mapping
    const orders = rows
      .filter((row) => {
        const rowEmail = row[14]?.trim().toLowerCase();
        return rowEmail === email.toLowerCase();
      })
      .map((row) => ({
        invoice: row[0] || "",
        tanggal: parseTanggal(row[1]),
        tanggalRaw: row[1] || "",
        subtotal: Number(row[7]) || 0,
        ongkir: Number(row[8]) || 0,
        total: Number(row[9]) || 0,
        status: String(row[12] || "PENDING").toUpperCase(),
        payment: String(row[11] || ""),
        produk: String(row[5] || ""),
        invoiceUrl: row[13] || "",
      }))
      .sort((a, b) => {
        const dateA = a.tanggal ? a.tanggal.getTime() : 0;
        const dateB = b.tanggal ? b.tanggal.getTime() : 0;
        return dateB - dateA;
      });

    // 🔥 Summary
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
    const paidOrders = orders.filter((o) => ["PAID", "SELESAI", "COD"].includes(o.status));
    const lastOrder = orders.length > 0 ? orders[0] : null;

    return NextResponse.json({
      success: true,
      summary: {
        totalOrders,
        totalSpent,
        totalSpentFormatted: formatRupiah(totalSpent),
        paidOrders: paidOrders.length,
        lastOrderDate: lastOrder?.tanggal ? formatTanggal(lastOrder.tanggal) : "-",
        lastOrderStatus: lastOrder?.status || "-",
        lastOrderInvoice: lastOrder?.invoice || "-",
      },
      orders,
    });
  } catch (error) {
    console.error("❌ Customer orders error:", error);
    return NextResponse.json(
      { 
        success: false, 
        orders: [],
        summary: null,
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
