// app/api/master-produk/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { products } from "@/lib/products"; // 🔥 UBAH: pake "products" (bukan productsStatic)

export async function GET() {
  try {
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL ?? "";
    const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY ?? "";
    const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";

    const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n").replace(/\\\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: CLIENT_EMAIL, private_key: PRIVATE_KEY },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Produk!A2:J",
    });

    const rows = res.data.values ?? [];

    const productsData = rows
      .filter((r) => r[6] && r[6].toString().toUpperCase() === "YES")
      .map((r) => {
        const id = r[0] ?? "";
        // 🔥 Cari dari array "products" (bukan productsStatic)
        const staticData = products.find((p) => p.id === id);

        return {
          id: id,
          slug: r[1] ?? "",
          nama: r[2] ?? "",
          kategori: r[3] ?? "",
          harga: Number(r[4]) || 0,
          stok: Number(r[5]) || 0,
          aktif: r[6] ?? "",
          img: r[7] ?? "",
          updatedAt: r[8] ?? "",
          createdAt: r[9] ?? "",
          slogan: staticData?.slogan || "",
          ingredients: staticData?.ingredients || [],
          benefits: staticData?.benefits || [],
          goodFor: staticData?.goodFor || [],
          consumeTime: staticData?.consumeTime || "",
          isPackage: staticData?.isPackage || false,
          brand: staticData?.brand || "KOJE24",
        };
      });

    return NextResponse.json({ success: true, products: productsData });
  } catch (err: any) {
    console.error("API MASTER PRODUK ERROR:", err);
    return NextResponse.json({ success: false, products: [], message: err.message }, { status: 500 });
  }
}
