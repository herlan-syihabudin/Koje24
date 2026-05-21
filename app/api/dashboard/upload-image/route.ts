// app/api/dashboard/upload-image/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

export async function POST(req: Request) {
  // 🔥 1. AUTH GUARD (WAJIB!)
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    // 🔥 2. VALIDASI FILE
    if (!file) {
      return NextResponse.json(
        { success: false, message: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    // 🔥 3. VALIDASI TIPE FILE
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Hanya support JPG, PNG, WEBP" },
        { status: 400 }
      );
    }

    // 🔥 4. VALIDASI UKURAN (max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ukuran file maksimal 2MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // 🔥 5. CEK ENVIRONMENT VARIABLES
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!clientEmail || !privateKey || !folderId) {
      console.error("Missing ENV:", { 
        hasEmail: !!clientEmail, 
        hasKey: !!privateKey, 
        hasFolderId: !!folderId 
      });
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

    // 🔥 6. SANITASI NAMA FILE
    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "-")
      .replace(/-+/g, "-");
    const fileName = `${Date.now()}-${safeName}`;

    // 🔥 7. UPLOAD KE GOOGLE DRIVE
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        description: `Uploaded via KOJE24 Dashboard at ${new Date().toISOString()}`,
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id, webViewLink",
    });

    const fileId = res.data.id;
    if (!fileId) {
      throw new Error("Upload gagal, tidak mendapat fileId");
    }

    // 🔥 8. SET PUBLIC ACCESS
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // 🔥 9. GENERATE URL (2 pilihan)
    // Opsi A: URL langsung (recommended)
    const directUrl = `https://drive.google.com/uc?id=${fileId}&export=view`;
    
    // Opsi B: URL embed (alternatif)
    // const embedUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;

    console.log(`✅ Upload success: ${fileName} by ${guard.admin.email}`);

    return NextResponse.json({
      success: true,
      url: directUrl,
      fileId: fileId,
    });
  } catch (error: any) {
    console.error("UPLOAD_ERROR:", error.message);
    
    // 🔥 10. ERROR HANDLING DETAIL
    let errorMessage = "Gagal upload gambar";
    if (error.message?.includes("permission")) {
      errorMessage = "Gagal mengakses Google Drive, cek permission";
    } else if (error.message?.includes("folder")) {
      errorMessage = "Folder Google Drive tidak ditemukan";
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage, detail: error.message },
      { status: 500 }
    );
  }
}
