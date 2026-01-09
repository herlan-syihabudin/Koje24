// /app/api/debug/create-drive-folder/route.ts
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.create({
    requestBody: {
      name: "KOJE24_PRODUCTS",
      mimeType: "application/vnd.google-apps.folder",
    },
  });

  return NextResponse.json({
    folderId: res.data.id,
  });
}
