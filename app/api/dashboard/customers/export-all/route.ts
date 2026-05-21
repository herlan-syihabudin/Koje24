import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

export async function GET(req: NextRequest) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
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
        customerMap.set(email, {
          id: email,
          nama: row[2] || email.split("@")[0],
          email: email,
          telepon: row[3] || "",
          totalOrder: 0,
          totalBelanja: 0,
        });
      }

      const customer = customerMap.get(email);
      if (row[12] === "PAID" || row[12] === "SELESAI") {
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
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #0FA3A8; margin: 0; }
          .summary { display: flex; gap: 20px; margin-bottom: 30px; }
          .summary-card { background: #f5f5f5; padding: 15px; border-radius: 8px; flex: 1; text-align: center; }
          .summary-card h3 { margin: 0; color: #666; }
          .summary-card .value { font-size: 24px; font-weight: bold; color: #0FA3A8; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #0FA3A8; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KOJE24</h1>
          <p>Laporan Data Pelanggan</p>
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
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Pelanggan</th>
              <th>Email</th>
              <th>Telepon</th>
              <th>Total Order</th>
              <th>Total Belanja</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map((c, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${c.nama}</strong>${c.totalOrder > 1 ? ' ⭐' : ''}</td>
                <td>${c.email}</td>
                <td>${c.telepon || "-"}</td>
                <td style="text-align:center">${c.totalOrder} x</td>
                <td style="text-align:right">Rp ${c.totalBelanja.toLocaleString("id-ID")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>Dicetak pada: ${new Date().toLocaleString("id-ID")}</p>
          <p>© KOJE24 - Cold Pressed Juice</p>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Export all customers error:", error);
    return new NextResponse("Gagal export", { status: 500 });
  }
}
