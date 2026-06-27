// app/api/master-produk/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // ✅ LOG UNTUK DEBUG (di production akan muncul di Vercel logs)
    console.log("[API] Starting fetch products...");
    
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
    const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
    const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";

    // ✅ VALIDASI DENGAN LOG
    if (!CLIENT_EMAIL || !PRIVATE_KEY_RAW || !SHEET_ID) {
      console.error("[API] Missing credentials:", {
        hasEmail: !!CLIENT_EMAIL,
        hasKey: !!PRIVATE_KEY_RAW,
        hasSheetId: !!SHEET_ID,
      });
      return NextResponse.json(
        { success: false, products: [], message: "Server configuration error" },
        { status: 500 }
      );
    }

    // ✅ PERBAIKI: Handle private key dengan lebih baik
    let PRIVATE_KEY = PRIVATE_KEY_RAW;
    // Hapus semua escape sequence
    PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, "\n");
    PRIVATE_KEY = PRIVATE_KEY.replace(/\\\\n/g, "\n");
    // Jika masih ada "\\n" literal, replace lagi
    PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, "\n");
    PRIVATE_KEY = PRIVATE_KEY.trim();

    // ✅ VALIDASI: Pastikan private key mengandung BEGIN/END
    if (!PRIVATE_KEY.includes("BEGIN PRIVATE KEY")) {
      console.error("[API] Invalid private key format");
      return NextResponse.json(
        { success: false, products: [], message: "Invalid private key format" },
        { status: 500 }
      );
    }

    // ✅ PERBAIKI: Auth dengan cara yang lebih robust
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ✅ HAPUS TIMEOUT (tidak efektif untuk googleapis)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Produk!A2:P", // ✅ Pastikan nama sheet "Produk"
    });

    const rows = res.data.values ?? [];
    console.log(`[API] Found ${rows.length} rows in sheet`);

    // Parse JSON array
    const parseJSONArray = (str: string): string[] => {
      if (!str || str === "") return [];
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [str];
      } catch {
        return str
          .split(",")
          .map(s => s.trim())
          .filter(Boolean);
      }
    };

    // Mapping produk
    const productsData = rows
      .filter((row) => {
        const aktif = row[6]?.toString().toUpperCase();
        return aktif === "YES" || aktif === "TRUE" || aktif === "1";
      })
      .map((row) => {
        const kategori = row[3] ?? "";
        const nama = row[2] ?? "";
        
        const isPackage = 
          kategori.toLowerCase() === "paket" || 
          nama.toLowerCase().includes("paket") ||
          kategori.toLowerCase().includes("bundle");
        
        const harga = Number(row[4]) || 0;
        const stok = Number(row[5]) || 0;
        
        return {
          id: row[0]?.trim() ?? `prod-${Date.now()}-${Math.random()}`,
          slug: row[1]?.trim() ?? `produk-${Date.now()}`,
          nama: nama.trim(),
          kategori: kategori.trim(),
          harga: harga,
          hargaAsli: harga,
          stok: stok,
          aktif: row[6] ?? "NO",
          img: row[7]?.trim() ?? "/images/placeholder.jpg",
          updatedAt: row[8] ?? new Date().toISOString(),
          createdAt: row[9] ?? new Date().toISOString(),
          slogan: row[10]?.trim() ?? "",
          ingredients: parseJSONArray(row[11]),
          benefits: parseJSONArray(row[12]),
          goodFor: parseJSONArray(row[13]),
          consumeTime: row[14]?.trim() ?? "Kapan saja",
          desc: row[15]?.trim() ?? "",
          isPackage: isPackage,
          brand: "KOJE24",
        };
      })
      .filter((product) => product.harga > 0);

    console.log(`[API] Returning ${productsData.length} products`);

    return NextResponse.json(
      { success: true, products: productsData, total: productsData.length },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (err: any) {
    console.error("[API] ERROR:", err);
    
    // ✅ CEK ERROR TYPE UNTUK DEBUG
    let message = err.message || "Failed to fetch products";
    let status = 500;
    
    if (err.code === 401 || err.code === 403) {
      message = "Google Sheets authentication failed. Please check credentials.";
      status = 401;
    } else if (err.code === 404) {
      message = "Sheet not found. Please check sheet ID and name.";
      status = 404;
    }
    
    return NextResponse.json(
      {
        success: false,
        products: [],
        message: message,
        error: process.env.NODE_ENV === "development" ? err.stack : undefined,
        code: err.code,
      },
      { status }
    );
  }
}
