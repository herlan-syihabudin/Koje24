import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

function parseTanggal(raw: string): string {
  if (!raw) return "";
  const datePart = raw.split(",")[0];
  return datePart;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const { id } = await params;
    const email = decodeURIComponent(id);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    
    let customerInfo = null;
    const orders = [];
    let totalBelanja = 0;
    let totalOrder = 0;

    rows.forEach((row) => {
      const rowEmail = row[14]?.trim().toLowerCase();
      if (rowEmail !== email.toLowerCase()) return;

      const status = row[12];
      const total = Number(row[9]) || 0;

      if (!customerInfo) {
        customerInfo = {
          nama: row[2] || email.split("@")[0],
          email: email,
          telepon: row[3] || "",
          alamat: row[4] || "",
        };
      }

      if (status === "PAID" || status === "SELESAI") {
        orders.push({
          invoice: row[0],
          tanggal: parseTanggal(row[1]),
          produk: row[5],
          qty: Number(row[6]) || 0,
          total: total,
        });
        totalBelanja += total;
        totalOrder++;
      }
    });

    if (!customerInfo) {
      return new NextResponse("Customer tidak ditemukan", { status: 404 });
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Riwayat Order ${customerInfo.nama}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #0FA3A8; margin: 0; }
          .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .summary { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .summary .total { font-size: 18px; font-weight: bold; color: #0FA3A8; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #0FA3A8; color: white; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
          .repeat-badge { background: #ff9800; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KOJE24</h1>
          <p>Riwayat Order Pelanggan</p>
        </div>

        <div class="info-box">
          <h3>Informasi Pelanggan</h3>
          <p><strong>Nama:</strong> ${customerInfo.nama}</p>
          <p><strong>Email:</strong> ${customerInfo.email}</p>
          <p><strong>Telepon:</strong> ${customerInfo.telepon || "-"}</p>
          <p><strong>Alamat:</strong> ${customerInfo.alamat || "-"}</p>
        </div>

        <div class="summary">
          <h3>📊 Ringkasan Belanja</h3>
          <p>Total Order: <strong>${totalOrder} kali</strong> ${totalOrder > 5 ? '<span class="repeat-badge">⭐ Repeat Customer</span>' : ''}</p>
          <p>Total Belanja: <strong class="total">Rp ${totalBelanja.toLocaleString("id-ID")}</strong></p>
          <p>Rata-rata per order: <strong>Rp ${Math.round(totalBelanja / totalOrder).toLocaleString("id-ID")}</strong></p>
        </div>

        <h3>📋 Daftar Order (${totalOrder} transaksi)</h3>
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Invoice</th>
              <th>Produk</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td>${order.tanggal}</td>
                <td>${order.invoice}</td>
                <td>${order.produk.substring(0, 60)}${order.produk.length > 60 ? "..." : ""}</td>
                <td style="text-align:center">${order.qty}</td>
                <td style="text-align:right">Rp ${order.total.toLocaleString("id-ID")}</td>
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
    console.error("Export customer error:", error);
    return new NextResponse("Gagal export", { status: 500 });
  }
}
