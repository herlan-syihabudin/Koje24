import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Tidak ada file yang di-upload" },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Format gambar harus JPG / PNG / WEBP" },
        { status: 400 }
      );
    }

    // Maksimal ukuran 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ukuran gambar maksimal 5MB" },
        { status: 400 }
      );
    }

    // Sanitasi nama file
    const safeName = file.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-.]/g, ""); // karakter aneh dihapus

    // Nama file unik
    const fileName = `testimoni/${Date.now()}-${safeName}`;

    // Upload ke Vercel Blob
    const { url } = await put(fileName, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      url,
      message: "Upload berhasil",
    });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal upload gambar",
        detail: err?.message ?? err,
      },
      { status: 500 }
    );
  }
}
