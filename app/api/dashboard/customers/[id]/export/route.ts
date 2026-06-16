// app/api/dashboard/customers/[id]/export/route.ts

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

function parseTanggal(raw: string): string {
  if (!raw) return "";
  const datePart = raw.split(",")[0]; // "6/1/2026"
  return datePart;
}

function formatName(name: string, email: string): string {
  if (name && name.trim()) {
    return name
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  const emailName = email.split("@")[0];
  return emailName
    .split(/[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

type CustomerInfo = {
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
};

type OrderItem = {
  invoice: string;
  tanggal: string;
  produk: string;
  qty: number;
  total: number;
  status: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdminFromRequest(req);
    if (!guard.ok) return guard.res;

    const { id } = await params;
    const email = decodeURIComponent(id);

    console.log(`📄 Customer export by: ${guard.admin?.email || "unknown"} for: ${email}`);

    // 🔥 Validasi email
    if (!email || !email.includes("@") || !email.includes(".")) {
      return new NextResponse("Email tidak valid", { status: 400 });
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    
    let customerInfo: CustomerInfo | null = null;
    const orders: OrderItem[] = [];
    let totalBelanja = 0;
    let totalOrder = 0;

    const completedStatus = ["PAID", "SELESAI", "COD", "DIKIRIM"];

    rows.forEach((row) => {
      const rowEmail = row[14]?.trim().toLowerCase();
      if (rowEmail !== email.toLowerCase()) return;

      const status = String(row[12] || "").toUpperCase();
      const total = Number(row[9]) || 0;

      if (!customerInfo) {
        customerInfo = {
          nama: formatName(row[2] || "", email),
          email: email,
          telepon: row[3] || "",
          alamat: row[4] || "",
        };
      }

      if (completedStatus.includes(status)) {
        orders.push({
          invoice: row[0] || "",
          tanggal: parseTanggal(row[1]),
          produk: row[5] || "",
          qty: Number(row[6]) || 0,
          total: total,
          status,
        });
        totalBelanja += total;
        totalOrder++;
      }
    });

    if (!customerInfo) {
      return new NextResponse("Customer tidak ditemukan", { 
        status: 404,
        headers: { "Content-Type": "text/plain" }
      });
    }

    const { nama, email: customerEmail, telepon, alamat } = customerInfo;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Riwayat Order ${nama}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; margin: 40px; background: #fff; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0FA3A8; padding-bottom: 15px; }
          .header h1 { color: #0FA3A8; margin: 0; font-size: 28px; }
          .header p { color: #666; margin: 5px 0 0; }
          .info-box { background: #f8fcfc; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e6eeee; }
          .info-box h3 { margin-top: 0; color: #0B4B50; }
          .info-box p { margin: 5px 0; }
          .summary { background: #e8f5e9; padding: 15px 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c8e6c9; }
          .summary h3 { margin-top: 0; color: #2e7d32; }
          .summary .total { font-size: 18px; font-weight: bold; color: #0FA3A8; }
          .repeat-badge { background: #ff9800; color: white; padding: 2px 10px; border-radius: 12px; font-size: 11px; display: inline-block; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
          th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: left; }
          th { background-color: #0FA3A8; color: white; font-weight: 600; }
          tr:nth-child(even) { background-color: #f9fcfc; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          .status-badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          }
          .status-badge.paid { background: #4CAF50; color: white; }
          .status-badge.selesai { background: #2196F3; color: white; }
          .status-badge.cod { background: #FF9800; color: white; }
          .status-badge.dikirim { background: #9C27B0; color: white; }
          @media print {
            .no-print { display: none; }
            body { margin: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🧃 KOJE24</h1>
          <p>Riwayat Order Pelanggan</p>
          <p style="font-size:12px;color:#999;">Dicetak: ${new Date().toLocaleString("id-ID")}</p>
        </div>

        <div class="info-box">
          <h3>👤 Informasi Pelanggan</h3>
          <p><strong>Nama:</strong> ${nama}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Telepon:</strong> ${telepon || "-"}</p>
          <p><strong>Alamat:</strong> ${alamat || "-"}</p>
        </div>

        <div class="summary">
          <h3>📊 Ringkasan Belanja</h3>
          <p>Total Order: <strong>${totalOrder} kali</strong> ${totalOrder > 1 ? '<span class="repeat-badge">⭐ Repeat Customer</span>' : ''}</p>
          <p>Total Belanja: <strong class="total">Rp ${totalBelanja.toLocaleString("id-ID")}</strong></p>
          <p>Rata-rata per order: <strong>Rp ${totalOrder > 0 ? Math.round(totalBelanja / totalOrder).toLocaleString("id-ID") : 0}</strong></p>
        </div>

        <h3>📋 Daftar Order (${totalOrder} transaksi)</h3>
        ${orders.length === 0 ? '<p style="color:#999;">Belum ada order yang selesai.</p>' : `
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Invoice</th>
              <th>Produk</th>
              <th class="text-center">Qty</th>
              <th>Status</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td>${order.tanggal || "-"}</td>
                <td><strong>${order.invoice}</strong></td>
                <td>${order.produk.substring(0, 60)}${order.produk.length > 60 ? "..." : ""}</td>
                <td class="text-center">${order.qty}</td>
                <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                <td class="text-right">Rp ${order.total.toLocaleString("id-ID")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        `}

        <div class="footer">
          <p>© ${new Date().getFullYear()} KOJE24 - Cold Pressed Juice • Laporan otomatis dari dashboard</p>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("❌ Export customer error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(
      `Gagal export: ${message}`,
      { status: 500 }
    );
  }
}
