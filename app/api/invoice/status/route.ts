import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n");

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, status } = await req.json();
    if (!invoiceId || !status) throw new Error("invoiceId & status wajib");

    const NEW_STATUS = String(status).trim();

    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    // Ambil semua transaksi
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet2!A:N", // sesuai penyimpanan order
    });

    const rows = sheetData.data.values ?? [];
    let rowNumber: number | null = null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const idColA = String(row[0] || "").trim(); // Invoice ID kolom A
      if (idColA === invoiceId) {
        rowNumber = i + 1;
        break;
      }
    }

    if (!rowNumber) {
      return NextResponse.json({
        success: false,
        message: "Invoice tidak ditemukan",
      });
    }

    // Kolom M → Status
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet2!M${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[NEW_STATUS]] },
    });

    return NextResponse.json({
      success: true,
      message: `Status invoice ${invoiceId} berhasil diperbarui menjadi ${NEW_STATUS}`,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err?.message ?? "Gagal update status",
    });
  }
}
