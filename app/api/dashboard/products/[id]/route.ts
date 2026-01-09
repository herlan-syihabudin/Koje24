import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

const SHEET_NAME = "Produk";
const RANGE = `${SHEET_NAME}!A2:J`;

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}
function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
function asYESNO(v: any): "YES" | "NO" {
  const s = String(v || "").toUpperCase().trim();
  return s === "YES" ? "YES" : "NO";
}
function toNum(v: any, fallback = 0) {
  const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

// Next.js kamu minta params sebagai Promise (lihat error Vercel kamu)
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: Ctx) {
  const guard = requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const { id } = await context.params;
    const cleanId = String(id || "").trim();
    if (!cleanId) {
      return NextResponse.json(
        { success: false, message: "ID tidak valid" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const ts = now();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values || [];
    const idx = rows.findIndex((r) => String(r?.[0] || "").trim() === cleanId);
    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    const sheetRow = idx + 2;
    const current = rows[idx] || [];
    const currentSlug = String(current[1] || "").trim();

    const nama =
      body?.nama !== undefined
        ? String(body.nama).trim()
        : String(current[2] || "").trim();

    const slug =
      body?.slug !== undefined ? slugify(body.slug) : currentSlug;

    const kategori =
      body?.kategori !== undefined
        ? String(body.kategori).trim()
        : String(current[3] || "").trim();

    const harga =
      body?.harga !== undefined ? toNum(body.harga, 0) : toNum(current[4], 0);

    const stok =
      body?.stok !== undefined ? toNum(body.stok, 0) : toNum(current[5], 0);

    const aktif =
      body?.aktif !== undefined ? asYESNO(body.aktif) : asYESNO(current[6]);

    const thumbnail =
      body?.thumbnail !== undefined
        ? String(body.thumbnail || "").trim()
        : String(current[7] || "").trim();

    // slug unik kalau berubah
    if (slug !== currentSlug) {
      const slugExists = rows.some(
        (r, i) => i !== idx && String(r?.[1] || "").trim() === slug
      );
      if (slugExists) {
        return NextResponse.json(
          { success: false, message: "slug sudah dipakai" },
          { status: 409 }
        );
      }
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${sheetRow}:J${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            cleanId,
            slug,
            nama,
            kategori,
            harga,
            stok,
            aktif,
            thumbnail,
            ts,
            String(current[9] || ts), // createdAt tetap
          ],
        ],
      },
    });

    // audit log optional
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Audit_Log!A:G",
        valueInputOption: "RAW",
        requestBody: {
          values: [[ts, cleanId, "UPDATE_PRODUCT", "-", nama, "dashboard", guard.admin.email]],
        },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: Ctx) {
  const guard = requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const { id } = await context.params;
    const cleanId = String(id || "").trim();
    if (!cleanId) {
      return NextResponse.json(
        { success: false, message: "ID tidak valid" },
        { status: 400 }
      );
    }

    const ts = now();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values || [];
    const idx = rows.findIndex((r) => String(r?.[0] || "").trim() === cleanId);
    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    const sheetRow = idx + 2;

    // soft delete: aktif=NO, updatedAt=ts
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: "RAW",
        data: [
          { range: `${SHEET_NAME}!G${sheetRow}`, values: [["NO"]] },
          { range: `${SHEET_NAME}!I${sheetRow}`, values: [[ts]] },
        ],
      },
    });

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Audit_Log!A:G",
        valueInputOption: "RAW",
        requestBody: {
          values: [[ts, cleanId, "SOFT_DELETE_PRODUCT", "-", "aktif=NO", "dashboard", guard.admin.email]],
        },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
