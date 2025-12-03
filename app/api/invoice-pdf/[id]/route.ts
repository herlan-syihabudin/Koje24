import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const API_KEY = process.env.HTML2PDF_KEY || "demo";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // ⛔ jangan await — langsung ambil param
    const { id } = context.params;

    const invoiceUrl = `${req.nextUrl.origin}/invoice/${id}`;

    const pdfReqUrl = `https://api.html2pdf.app/v1/generate?apiKey=${API_KEY}&url=${encodeURIComponent(
      invoiceUrl
    )}&format=A4&printBackground=true&margin=10mm`;

    const result = await fetch(pdfReqUrl);

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
    console.error("PDF error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF", detail: err?.message ?? err },
      { status: 500 }
    );
  }
}
