// app/api/dashboard/upload-image/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server"; // 🔥 IMPORT INI!
import { google } from "googleapis";
import { Readable } from "stream";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

export async function POST(req: NextRequest) { // 🔥 UBAH JADI NextRequest
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!clientEmail || !privateKey || !folderId) {
      return NextResponse.json(
        { success: false, message: "Konfigurasi server tidak lengkap" },
        { status: 500 }
      );
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "-")
      .replace(/-+/g, "-");
    const fileName = `${Date.now()}-${safeName}`;

    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id",
    });

    const fileId = res.data.id;
    if (!fileId) {
      throw new Error("Upload gagal, tidak mendapat fileId");
    }

    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const directUrl = `https://drive.google.com/uc?id=${fileId}&export=view`;

    return NextResponse.json({
      success: true,
      url: directUrl,
      fileId: fileId,
    });
  } catch (error: any) {
    console.error("UPLOAD_ERROR:", error.message);
    
    let errorMessage = "Gagal upload gambar";
    if (error.message?.includes("permission")) {
      errorMessage = "Gagal mengakses Google Drive, cek permission";
    } else if (error.message?.includes("folder")) {
      errorMessage = "Folder Google Drive tidak ditemukan";
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
