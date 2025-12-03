import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // cepat & stabil

const API_KEY = process.env.HTML2PDF_KEY || "demo";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id; // 👍 id langsung terbaca

    const invoiceUrl = `${req.nextUrl.origin}/invoice/${id}`;

    const pdfReqUrl = `https://api.html2pdf.app/v1/generate?apiKey=${API_KEY}&url=${encodeURIComponent(
      invoiceUrl
    )}&format=A4&printBackground=true&margin=10mm`;

    const result = await fetch(pdfReqUrl, { cache: "no-store" });

    if (!result.ok) throw new Error("Gagal generate PDF");

    const pdf = await result.arrayBuffer();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${id}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
