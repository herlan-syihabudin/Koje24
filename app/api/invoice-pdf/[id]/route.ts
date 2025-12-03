import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // <- WAJIB pakai await di Next 16

  try {
    const invoiceUrl = `${req.nextUrl.origin}/invoice/${id}`;
    const pdfReqUrl = `https://api.html2pdf.app/v1/generate?apiKey=${process.env.HTML2PDF_KEY}&url=${encodeURIComponent(
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
    return NextResponse.json(
      { error: "Failed to generate PDF", detail: err?.message ?? err },
      { status: 500 }
    );
  }
}
