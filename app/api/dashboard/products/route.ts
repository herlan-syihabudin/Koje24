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

type Product = {
  id: string;
  slug: string;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  aktif: "YES" | "NO";
  thumbnail?: string;
  updatedAt?: string;
  createdAt?: string;
};

function rowToProduct(row: any[]): Product {
  return {
    id: String(row[0] || "").trim(),
    slug: String(row[1] || "").trim(),
    nama: String(row[2] || "").trim(),
    kategori: String(row[3] || "").trim(),
    harga: toNum(row[4], 0),
    stok: toNum(row[5], 0),
    aktif: asYESNO(row[6]),
    thumbnail: String(row[7] || "").trim(),
    updatedAt: String(row[8] || "").trim(),
    createdAt: String(row[9] || "").trim(),
  };
}

function makeId() {
  // simple, cukup kuat utk internal (bukan security id)
  return "P" + Date.now().toString(36).toUpperCase();
}

/* =====================
   GET: LIST PRODUK
   /api/dashboard/products?q=detox&aktif=YES|NO|ALL&sort=updatedAt|nama&dir=asc|desc
===================== */
export async function GET(req: NextRequest) {
  const guard = requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const { searchParams } = new URL(req.url);
    const q = String(searchParams.get("q") || "").toLowerCase().trim();
    const aktif = String(searchParams.get("aktif") || "ALL").toUpperCase();
    const sort = String(searchParams.get("sort") || "updatedAt");
    const dir = String(searchParams.get("dir") || "desc").toLowerCase();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values || [];
    let products = rows
      .map(rowToProduct)
      .filter((p) => p.id && p.nama);

    // filter aktif
    if (aktif !== "ALL") {
      products = products.filter((p) => p.aktif === (aktif as any));
    }

    // search
    if (q) {
      products = products.filter((p) => {
        const hay = `${p.nama} ${p.slug} ${p.kategori}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // sort
    products.sort((a, b) => {
      let av: any = (a as any)[sort];
      let bv: any = (b as any)[sort];

      // fallback
      if (sort === "harga" || sort === "stok") {
        av = Number(av || 0);
        bv = Number(bv || 0);
      } else {
        av = String(av || "");
        bv = String(bv || "");
      }

      const cmp = av > bv ? 1 : av < bv ? -1 : 0;
      return dir === "asc" ? cmp : -cmp;
    });

    return NextResponse.json({ success: true, products });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}

/* =====================
   POST: TAMBAH PRODUK
   body: { nama, kategori?, harga?, stok?, aktif?, thumbnail? }
===================== */
export async function POST(req: NextRequest) {
  const guard = requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const body = await req.json();

    const nama = String(body?.nama || "").trim();
    if (!nama) {
      return NextResponse.json(
        { success: false, message: "nama wajib diisi" },
        { status: 400 }
      );
    }

    const kategori = String(body?.kategori || "").trim();
    const harga = toNum(body?.harga, 0);
    const stok = toNum(body?.stok, 0);
    const aktif = asYESNO(body?.aktif || "YES");
    const thumbnail = String(body?.thumbnail || "").trim();

    const id = makeId();
    const slug = slugify(body?.slug || nama);
    const ts = now();

    // cek slug unik
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = existing.data.values || [];
    const slugExists = rows.some((r) => String(r?.[1] || "").trim() === slug);
    if (slugExists) {
      return NextResponse.json(
        { success: false, message: "slug sudah dipakai, ganti nama/slug" },
        { status: 409 }
      );
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:J`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[id, slug, nama, kategori, harga, stok, aktif, thumbnail, ts, ts]],
      },
    });

    // audit log optional (kalau sheet Audit_Log ada)
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Audit_Log!A:G",
        valueInputOption: "RAW",
        requestBody: {
          values: [[ts, id, "CREATE_PRODUCT", "-", nama, "dashboard", guard.admin.email]],
        },
      });
    } catch {}

    return NextResponse.json({ success: true, id, slug });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
