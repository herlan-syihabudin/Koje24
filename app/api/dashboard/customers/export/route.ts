import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

export async function GET(req: Request) {
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
          nama: row[2] || email.split("@")[0],
          email,
          telepon: row[3] || "",
          totalOrder: 0,
          totalBelanja: 0,
        });
      }

      const customer = customerMap.get(email);
      if (row[12] === "PAID") {
        customer.totalOrder += 1;
        customer.totalBelanja += Number(row[9]) || 0;
      }
    });

    const customers = Array.from(customerMap.values());
    
    // Generate HTML for PDF
    const html = `
      <html>
        <head>
          <title>Daftar Pelanggan KOJE24</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #0FA3A8; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Daftar Pelanggan KOJE24</h1>
          <p>Tanggal: ${new Date().toLocaleDateString("id-ID")}</p>
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Total Order</th>
                <th>Total Belanja</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(c => `
                <tr>
                  <td>${c.nama}</td>
                  <td>${c.email}</td>
                  <td>${c.telepon}</td>
                  <td>${c.totalOrder}</td>
                  <td>Rp ${c.totalBelanja.toLocaleString("id-ID")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="total">
            <p>Total Pelanggan: ${customers.length}</p>
            <p>Total Pendapatan: Rp ${customers.reduce((sum, c) => sum + c.totalBelanja, 0).toLocaleString("id-ID")}</p>
          </div>
        </body>
      </html>
    `;

    // Convert HTML to PDF (gunakan library seperti puppeteer atau api lain)
    // Untuk sementara, return JSON dulu
    
    return NextResponse.json({ success: true, customers });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
