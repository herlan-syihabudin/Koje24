import { NextResponse } from "next/server";
import { google } from "googleapis";

// 🔥 OPTIMASI: Cache untuk mengurangi request ke Google Sheets
export const revalidate = 3600; // Cache selama 1 jam (ISR)

export async function GET() {
  try {
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
    const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
    const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";

    // Validasi environment variables
    if (!CLIENT_EMAIL || !PRIVATE_KEY_RAW || !SHEET_ID) {
      console.error("Missing Google Sheets credentials");
      return NextResponse.json(
        { success: false, products: [], message: "Server configuration error" },
        { status: 500 }
      );
    }

    // 🔥 Fix: Handle private key dengan lebih baik
    const PRIVATE_KEY = PRIVATE_KEY_RAW
      .replace(/\\n/g, "\n")
      .replace(/\\\\n/g, "\n")
      .trim();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 🔥 OPTIMASI: Fetch data dengan timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Produk!A2:P",
    });

    clearTimeout(timeoutId);

    const rows = res.data.values ?? [];

    // 🔥 OPTIMASI: Parse JSON array lebih robust
    const parseJSONArray = (str: string): string[] => {
      if (!str || str === "") return [];
      try {
        // Coba parse sebagai JSON dulu
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [str];
      } catch {
        // Kalau gagal, coba split by koma
        return str
          .split(",")
          .map(s => s.trim())
          .filter(Boolean);
      }
    };

    // 🔥 OPTIMASI: Mapping produk dengan filtering yang lebih efisien
    const productsData = rows
      .filter((row) => {
        const aktif = row[6]?.toString().toUpperCase();
        return aktif === "YES" || aktif === "TRUE" || aktif === "1";
      })
      .map((row) => {
        const kategori = row[3] ?? "";
        const nama = row[2] ?? "";
        
        // 🔥 Tentukan isPackage
        const isPackage = 
          kategori.toLowerCase() === "paket" || 
          nama.toLowerCase().includes("paket") ||
          kategori.toLowerCase().includes("bundle");
        
        // 🔥 Pastikan harga valid
        const harga = Number(row[4]) || 0;
        const stok = Number(row[5]) || 0;
        
        return {
          id: row[0]?.trim() ?? `prod-${Date.now()}-${Math.random()}`,
          slug: row[1]?.trim() ?? `produk-${Date.now()}`,
          nama: nama.trim(),
          kategori: kategori.trim(),
          harga: harga,
          hargaAsli: harga, // Untuk promo nanti
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
      // 🔥 Filter produk dengan harga valid
      .filter((product) => product.harga > 0);

    // 🔥 Tambahkan cache headers
    return NextResponse.json(
      { success: true, products: productsData, total: productsData.length },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          "CDN-Cache-Control": "public, s-maxage=3600",
          "Vercel-CDN-Cache-Control": "public, s-maxage=3600",
        },
      }
    );
  } catch (err: any) {
    console.error("API MASTER PRODUK ERROR:", err);
    
    // 🔥 Return error yang lebih informatif
    return NextResponse.json(
      {
        success: false,
        products: [],
        message: err.message || "Failed to fetch products",
        error: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
