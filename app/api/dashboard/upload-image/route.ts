import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({
        success: false,
        message: "File tidak ditemukan",
      });
    }

    // =========================
    // CONVERT FILE → STREAM
    // =========================
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // =========================
    // AUTH GOOGLE
    // =========================
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({
      version: "v3",
      auth,
    });

    // =========================
    // UPLOAD FILE
    // =========================
    const res = await drive.files.create({
      requestBody: {
        name: `${Date.now()}-${file.name}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      },
      media: {
        mimeType: file.type,
        body: stream, // ✅ HARUS STREAM
      },
    });

    const fileId = res.data.id;
    if (!fileId) {
      throw new Error("Gagal upload ke Google Drive");
    }

    // =========================
    // SET PUBLIC
    // =========================
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const url = `https://drive.google.com/uc?id=${fileId}`;

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (e: any) {
    console.error("UPLOAD ERROR:", e);
    return NextResponse.json({
      success: false,
      message: e.message,
    });
  }
}
