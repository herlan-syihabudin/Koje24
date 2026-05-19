import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Transaksi!A2:P",
    });

    const rows = res.data.values || [];
    const customerMap = new Map();

    rows.forEach((row) => {
      const email = row[14]; // Kolom O (Email)
      if (!email) return;

      const nama = row[2] || email.split("@")[0];
      const telepon = row[3] || "";
      const alamat = row[4] || "";
      const total = Number(row[9] || 0);
      const status = row[12] || "";

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          id: email,
          nama,
          email,
          telepon,
          kota: alamat.split(",").pop()?.trim() || "Jakarta",
          totalOrder: 0,
          totalBelanja: 0,
          status: "aktif",
        });
      }

      const customer = customerMap.get(email);
      if (status === "PAID") {
        customer.totalOrder += 1;
        customer.totalBelanja += total;
      }
    });

    const customers = Array.from(customerMap.values());
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    const stats = {
      total: customers.length,
      aktif: customers.filter((c) => c.totalOrder > 0).length,
      baru: customers.filter((c) => {
        // Perlu data created_at dari sheet
        return false;
      }).length,
    };

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
