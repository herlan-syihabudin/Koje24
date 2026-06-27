import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

function parseTanggal(raw: string): Date | null {
  if (!raw) return null;
  const datePart = raw.split(",")[0];
  const [d, m, y] = datePart.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function normalizeStatus(s: any): string {
  const status = String(s || "").trim().toUpperCase();
  if (status === "PAID" || status === "SELESAI") return "PAID";
  return status;
}

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    const customerMap = new Map();
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    rows.forEach((row) => {
      const email = row[14]?.trim(); // Kolom O (Email)
      
      // 🔥 SKIP kalo email kosong
      if (!email) return;

      const tanggalRaw = row[1];
      const dt = parseTanggal(tanggalRaw);
      if (!dt) return; // SKIP kalo tanggal invalid

      const nama = row[2] || email.split("@")[0];
      const telepon = row[3] || "";
      const alamat = row[4] || "";
      const total = Number(row[9] || 0);
      const statusRaw = row[12] || "";
      const status = normalizeStatus(statusRaw);

      // 🔥 Hanya hitung transaksi dengan status PAID
      if (status !== "PAID") return;

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          id: email,
          nama,
          email,
          telepon,
          kota: alamat.split(",").pop()?.trim() || "Jakarta",
          totalOrder: 0,
          totalBelanja: 0,
          firstOrderDate: dt,
          lastOrderDate: dt,
        });
      }

      const customer = customerMap.get(email);
      
      // Update first order date if earlier
      if (dt < customer.firstOrderDate) {
        customer.firstOrderDate = dt;
      }
      
      // Update last order date if later
      if (dt > customer.lastOrderDate) {
        customer.lastOrderDate = dt;
      }

      customer.totalOrder += 1;
      customer.totalBelanja += total;
    });

    const customers = Array.from(customerMap.values())
      .sort((a, b) => b.lastOrderDate.getTime() - a.lastOrderDate.getTime()) // Urutkan berdasarkan order terbaru
      .map((c) => ({
        ...c,
        firstOrderDate: c.firstOrderDate.toISOString().slice(0, 10),
        lastOrderDate: c.lastOrderDate.toISOString().slice(0, 10),
      }));

    // 🔥 Hitung pelanggan baru (30 hari terakhir dari firstOrderDate)
    const stats = {
      total: customers.length,
      aktif: customers.filter((c) => c.totalOrder > 0).length,
      baru: customers.filter((c) => {
        const firstDate = new Date(c.firstOrderDate);
        return firstDate >= thirtyDaysAgo;
      }).length,
    };

    console.log(`✅ Customers API: total=${stats.total}, aktif=${stats.aktif}, baru=${stats.baru}`);

    return NextResponse.json({
      success: true,
      customers,
      stats,
    });
  } catch (error) {
    console.error("Customers API error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data pelanggan" },
      { status: 500 }
    );
  }
}
