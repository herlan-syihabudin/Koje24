import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const invoiceId = params.id;
  if (!invoiceId) {
    return NextResponse.json({ error: "Missing invoice id" }, { status: 400 });
  }

  try {
    // Ambil HTML invoice
    const base = process.env.NEXT_PUBLIC_BASE_URL || "";
    const htmlRes = await fetch(`${base}/invoice/${invoiceId}`, { cache: "no-store" });
    const html = await htmlRes.text();

    // Convert HTML ke PDF via Chrome headless (Cloudconvert endpoint bebas error)
    const pdfRes = await fetch("https://api.cloudconvert.com/v2/convert", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CLOUDCONVERT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input_format: "html",
        output_format: "pdf",
        input: "raw",
        filename: `Koje24-inv-${invoiceId}.pdf`,
        file: html,
      }),
    });

    const buffer = Buffer.from(await pdfRes.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Koje24-inv-${invoiceId}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal generate PDF" }, { status: 500 });
  }
}
