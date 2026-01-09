import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    // ❌ JANGAN CEK FOLDER DENGAN files.get
    // ✅ LANGSUNG CREATE

    const res = await drive.files.create({
      requestBody: {
        name: `${Date.now()}-${file.name}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id",
    });

    const fileId = res.data.id;
    if (!fileId) throw new Error("Upload gagal, fileId kosong");

    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    return NextResponse.json({
      success: true,
      url: `https://drive.google.com/uc?id=${fileId}`,
    });

  } catch (e: any) {
    console.error("UPLOAD_ERROR:", e.message);
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
