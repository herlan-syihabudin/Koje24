import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "File tidak ditemukan" }, { status: 400 });
    }

    // 1. Convert File ke Buffer & Stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // 2. Setup Auth (Pastikan ENV Lu Lengkap)
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/drive"]
    );

    const drive = google.drive({ version: "v3", auth });

    // 3. Create File di Google Drive
    const res = await drive.files.create({
      requestBody: {
        name: `${Date.now()}-${file.name}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id", // Hanya ambil ID untuk efisiensi
    });

    const fileId = res.data.id;

    if (!fileId) throw new Error("Gagal mendapatkan File ID dari Google Drive");

    // 4. Set Permission Jadi Public Reader (Biar gambar bisa tampil di Web)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // 5. Generate Direct Link
    // Format uc?id adalah yang paling stabil untuk thumbnail/gambar
    const url = `https://drive.google.com/uc?id=${fileId}`;

    return NextResponse.json({ 
      success: true, 
      url, 
      fileId 
    });

  } catch (e: any) {
    console.error("UPLOAD_ERROR:", e.message);
    
    // Handler khusus untuk masalah kuota
    if (e.message.includes("storage quota")) {
      return NextResponse.json({
        success: false,
        message: "Quota robot habis. Pastikan folder Drive sudah di-share: Anyone with link -> Editor",
      }, { status: 507 });
    }

    return NextResponse.json({
      success: false,
      message: e.message || "Gagal upload gambar",
    }, { status: 500 });
  }
}
