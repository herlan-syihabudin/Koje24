import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file" });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.create({
      requestBody: {
        name: `${Date.now()}-${file.name}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      },
      media: {
        mimeType: file.type,
        body: buffer,
      },
    });

    const fileId = res.data.id;

    // set public
    await drive.permissions.create({
      fileId: fileId!,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const url = `https://drive.google.com/uc?id=${fileId}`;

    return NextResponse.json({ success: true, url });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      message: e.message,
    });
  }
}
