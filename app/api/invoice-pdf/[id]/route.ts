import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing invoice ID" },
        { status: 400 }
      );
    }

    const invoiceUrl = `${req.nextUrl.origin}/invoice/${id}`;

    const API_KEY = process.env.HTML2PDF_KEY ?? "demo";
    const pdfReqUrl = `https://api.html2pdf.app/v1/generate?apiKey=${API_KEY}&url=${encodeURIComponent(
      invoiceUrl
    )}&format=A4&printBackground=true&margin=10mm`;

    const result = await fetch(pdfReqUrl);
    if (!result.ok) throw new Error("Failed to generate PDF");

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
      { success: false, message: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
