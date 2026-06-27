// app/api/dashboard/testimonials/route.ts

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdminFromRequest(req);
    if (!guard.ok) return guard.res;

    const showAll = req.nextUrl.searchParams.get("all") === "true";

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Testimoni!A2:H",
    });

    const rows = res.data.values || [];
    const testimonials = rows
      .filter((row) => row[0] && row[1]) // Minimal ada id & nama
      .map((row) => ({
        id: row[0] || "",
        nama: row[1] || "",
        kota: row[2] || "",
        pesan: row[3] || "",
        rating: Number(row[4]) || 5,
        varian: row[5] || "",
        img: row[6] || "",
        aktif: row[7]?.toLowerCase() === "true",
      }));

    // 🔥 Filter aktif kecuali showAll=true
    const data = showAll ? testimonials : testimonials.filter(t => t.aktif === true);

    console.log(`✅ ${data.length} testimonials fetched by: ${guard.admin?.email || "unknown"}`);

    return NextResponse.json({ 
      success: true, 
      testimonials: data,
      total: data.length,
      totalAll: testimonials.length,
    });
  } catch (error) {
    console.error("❌ GET testimonials error:", error);
    return NextResponse.json(
      { 
        success: false, 
        testimonials: [], 
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const guard = await requireAdminFromRequest(req);
    if (!guard.ok) return guard.res;

    const body = await req.json();
    const { id, aktif } = body;

    // 🔥 Validasi body
    if (!id || typeof aktif !== 'boolean') {
      return NextResponse.json(
        { success: false, message: "Invalid payload: id and aktif (boolean) required" },
        { status: 400 }
      );
    }

    // Cari baris dengan id tersebut
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Testimoni!A2:H",
    });

    const rows = res.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Testimoni tidak ditemukan" },
        { status: 404 }
      );
    }

    const sheetRow = rowIndex + 2;
    const oldActive = rows[rowIndex][7]?.toLowerCase() === "true";

    // Update status aktif di kolom H
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Testimoni!H${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[aktif ? "TRUE" : "FALSE"]],
      },
    });

    // 🔥 Audit log
    const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Audit_Log!A:G",
        valueInputOption: "RAW",
        requestBody: {
          values: [[
            ts,
            id,
            "UPDATE_TESTIMONIAL",
            `aktif: ${oldActive}`,
            `aktif: ${aktif}`,
            "dashboard",
            guard.admin?.email || "unknown",
          ]],
        },
      });
    } catch (err) {
      console.warn("⚠️ Failed to write audit log:", err);
    }

    console.log(`✅ Testimonial ${id} updated to ${aktif} by: ${guard.admin?.email || "unknown"}`);

    return NextResponse.json({ 
      success: true, 
      message: `Testimoni berhasil ${aktif ? 'diaktifkan' : 'dinonaktifkan'}` 
    });
  } catch (error) {
    console.error("❌ PATCH testimonial error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
