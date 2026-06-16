// app/api/dashboard/products/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

const SHEET_NAME = "Produk";
const RANGE = `${SHEET_NAME}!A2:P`;

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
  slogan?: string;
  ingredients?: string[];
  benefits?: string[];
  goodFor?: string[];
  consumeTime?: string;
  desc?: string;
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
    slogan: String(row[10] || "").trim(),
    ingredients: parseJSONArray(row[11]),
    benefits: parseJSONArray(row[12]),
    goodFor: parseJSONArray(row[13]),
    consumeTime: String(row[14] || "").trim(),
    desc: String(row[15] || "").trim(),
    updatedAt: String(row[8] || "").trim(),
    createdAt: String(row[9] || "").trim(),
  };
}

function parseJSONArray(str: string): string[] {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function makeId() {
  return "P" + Date.now().toString(36).toUpperCase();
}

export async function GET(req: NextRequest) {
  // 🔐 GUARD ADMIN (PAKE AWAIT!)
  const guard = await requireAdminFromRequest(req);
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

    if (aktif !== "ALL") {
      products = products.filter((p) => p.aktif === (aktif as any));
    }

    if (q) {
      products = products.filter((p) => {
        const hay = `${p.nama} ${p.slug} ${p.kategori}`.toLowerCase();
        return hay.includes(q);
      });
    }

    products.sort((a, b) => {
      let av: any = (a as any)[sort];
      let bv: any = (b as any)[sort];

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
    console.error("❌ GET products error:", e);
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // 🔐 GUARD ADMIN (PAKE AWAIT!)
  const guard = await requireAdminFromRequest(req);
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
    const slogan = String(body?.slogan || "").trim();
    const ingredients = JSON.stringify(body?.ingredients || []);
    const benefits = JSON.stringify(body?.benefits || []);
    const goodFor = JSON.stringify(body?.goodFor || []);
    const consumeTime = String(body?.consumeTime || "").trim();
    const desc = String(body?.desc || "").trim();
    
    let slug = body?.slug ? String(body.slug).trim() : slugify(nama);
    if (!slug) slug = slugify(nama);

    const id = makeId();
    const ts = now();

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = existing.data.values || [];
    let slugExists = rows.some((r) => String(r?.[1] || "").trim() === slug);
    
    let originalSlug = slug;
    let counter = 1;
    while (slugExists) {
      slug = `${originalSlug}-${counter}`;
      slugExists = rows.some((r) => String(r?.[1] || "").trim() === slug);
      counter++;
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:P`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          id, slug, nama, kategori, harga, stok, aktif, thumbnail, 
          ts, ts, slogan, ingredients, benefits, goodFor, consumeTime, desc
        ]],
      },
    });

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Audit_Log!A:G",
        valueInputOption: "RAW",
        requestBody: {
          values: [[
            ts, id, "CREATE_PRODUCT", "-", nama, "dashboard", 
            guard.admin?.email || "unknown"
          ]],
        },
      });
    } catch (err) {
      console.warn("⚠️ Failed to write audit log:", err);
    }

    return NextResponse.json({ success: true, id, slug });
  } catch (e: any) {
    console.error("❌ POST product error:", e);
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
