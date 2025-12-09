// app/api/invoice-file/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ⚡ paling stabil untuk generate PDF

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const invoiceId = id?.trim();

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, message: "Missing invoice ID" },
        { status: 400 }
      );
    }

    const API_KEY = process.env.HTML2PDF_KEY ?? "";
    if (!API_KEY) {
      return NextResponse.json(
        { success: false, message: "Missing HTML2PDF API key" },
        { status: 500 }
      );
    }

    const invoiceUrl = `${req.nextUrl.origin}/invoice/${invoiceId}`;

    const pdfReqUrl = `https://api.html2pdf.app/v1/generate?apiKey=${API_KEY}&url=${encodeURIComponent(
      invoiceUrl
    )}&format=A4&printBackground=true&margin=10mm&waitFor=1800`;

    const result = await fetch(pdfReqUrl);
    if (!result.ok) throw new Error("PDF failed");

    const pdf = await result.arrayBuffer();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoiceId}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("❌ INVOICE FILE ERROR:", err);
    return NextResponse.json(
      { success: false, message: err?.message ?? "Unexpected PDF error" },
      { status: 500 }
    );
  }
}
