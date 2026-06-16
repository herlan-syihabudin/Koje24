// app/api/dashboard/customers/route.ts

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

function formatName(name: string): string {
  return name
    .split(/[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdminFromRequest(req);
    if (!guard.ok) return guard.res;

    console.log(`✅ Customers exported by: ${guard.admin?.email || "unknown"}`);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    const customerMap = new Map();

    rows.forEach((row) => {
      const email = row[14];
      if (!email) return;

      if (!customerMap.has(email)) {
        const rawName = row[2] || email.split("@")[0];
        customerMap.set(email, {
          id: email,
          nama: formatName(rawName),
          email: email,
          telepon: row[3] || "",
          totalOrder: 0,
          totalBelanja: 0,
        });
      }

      const customer = customerMap.get(email);
      const status = String(row[12] || "").toUpperCase();
      // 🔥 Tambah COD & DIKIRIM
      const isCompleted = ["PAID", "SELESAI", "COD", "DIKIRIM"].includes(status);
      
      if (isCompleted) {
        customer.totalOrder += 1;
        customer.totalBelanja += Number(row[9]) || 0;
      }
    });

    const customers = Array.from(customerMap.values())
      .sort((a, b) => b.totalBelanja - a.totalBelanja);

    const totalCustomer = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalBelanja, 0);
    const repeatCustomers = customers.filter(c => c.totalOrder > 1).length;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Daftar Semua Pelanggan KOJE24</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; margin: 40px; background: #fff; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #0FA3A8; margin: 0; font-size: 28px; }
          .header p { color: #666; margin: 5px 0 0; }
          .summary { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
          .summary-card { background: #f8fcfc; padding: 15px 20px; border-radius: 8px; flex: 1; min-width: 150px; text-align: center; border: 1px solid #e6eeee; }
          .summary-card h3 { margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .summary-card .value { font-size: 24px; font-weight: bold; color: #0FA3A8; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: left; }
          th { background-color: #0FA3A8; color: white; font-weight: 600; }
          tr:nth-child(even) { background-color: #f9fcfc; }
          tr:hover { background-color: #f0f8f8; }
          .badge { background: #E8C46B; color: #0B4B50; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          @media print { .summary-card { border: 1px solid #ddd; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🧃 KOJE24</h1>
          <p>Laporan Data Pelanggan</p>
          <p style="font-size:12px;color:#999;">Dicetak: ${new Date().toLocaleString("id-ID")}</p>
        </div>

        <div class="summary">
          <div class="summary-card">
            <h3>Total Pelanggan</h3>
            <div class="value">${totalCustomer}</div>
          </div>
          <div class="summary-card">
            <h3>Total Pendapatan</h3>
            <div class="value">Rp ${totalRevenue.toLocaleString("id-ID")}</div>
          </div>
          <div class="summary-card">
            <h3>Repeat Customer</h3>
            <div class="value">${repeatCustomers}</div>
          </div>
          <div class="summary-card">
            <h3>Rata-rata Belanja</h3>
            <div class="value">Rp ${totalCustomer > 0 ? Math.round(totalRevenue / totalCustomer).toLocaleString("id-ID") : 0}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Pelanggan</th>
              <th>Email</th>
              <th>Telepon</th>
              <th class="text-center">Total Order</th>
              <th class="text-right">Total Belanja</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map((c, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>
                  <strong>${c.nama}</strong>
                  ${c.totalOrder > 1 ? ' <span class="badge">⭐ Repeat</span>' : ''}
                </td>
                <td>${c.email}</td>
                <td>${c.telepon || "-"}</td>
                <td class="text-center">${c.totalOrder} x</td>
                <td class="text-right">Rp ${c.totalBelanja.toLocaleString("id-ID")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

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
    console.error("❌ Export all customers error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(
      `Gagal export: ${message}`,
      { status: 500 }
    );
  }
}
