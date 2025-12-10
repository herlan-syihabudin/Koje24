import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const CLIENT_EMAIL = process.env.GS_CLIENT_EMAIL ?? "";
    const PRIVATE_KEY = (process.env.GS_PRIVATE_KEY ?? "")
      .replace(/\\n/g, "\n")
      .replace(/\\\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.GS_SHEET_ID ?? "";
    const range = "Transaksi!A2:N"; // SESUAI SHEET LO

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = result.data.values || [];

    const data = rows.map((r) => ({
      Invoice: r[0] || "",
      Tanggal: r[1] || "",
      Nama: r[2] || "",
      Hp: r[3] || "",
      Alamat: r[4] || "",
      Produk: r[5] || "",
      Qty: r[6] || "",
      Subtotal: r[7] || "",
      Ongkir: r[8] || "",
      Total: r[9] || "",
      Promo: r[10] || "",
      Metode: r[11] || "",
      Status: r[12] || "",
      URL: r[13] || "",
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("API TRANSAKSI ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
