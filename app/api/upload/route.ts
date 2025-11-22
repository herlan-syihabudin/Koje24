import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Nama file unik
  const fileName = `testimoni-${Date.now()}-${file.name.replace(/\s/g, "_")}`;

  // Upload ke Vercel Blob
  const { url } = await put(fileName, file, {
    access: "public", // supaya bisa diakses user
  });

  return NextResponse.json({ url });
}
