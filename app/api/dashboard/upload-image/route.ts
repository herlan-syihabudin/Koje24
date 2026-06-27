// app/api/dashboard/upload-image/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

export async function POST(req: NextRequest) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Hanya support JPG, PNG, WEBP" },
        { status: 400 }
      );
    }

    // Validasi ukuran (max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ukuran file maksimal 2MB" },
        { status: 400 }
      );
    }

    // Sanitasi nama file
    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "-")
      .replace(/-+/g, "-");
    const fileName = `products/${Date.now()}-${safeName}`;

    // 🔥 UPLOAD KE VERCEL BLOB (bukan Google Drive)
    const blob = await put(fileName, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error: any) {
    console.error("UPLOAD_ERROR:", error.message);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal upload gambar" },
      { status: 500 }
    );
  }
}
