import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 🔥 Ambil invoiceId tanpa "params"
    const invoiceId = req.url.split("/").pop()?.replace("?pdf=1", "").trim();
    if (!invoiceId) throw new Error("Invoice ID tidak valid");

    const API_KEY = process.env.HTML2PDF_KEY;
    if (!API_KEY) throw new Error("HTML2PDF API Key belum di-set");

    // 🔥 FIX origin (tanpa nextUrl)
    const origin =
      req.headers.get("origin") || new URL(req.url).origin;

    // PDF mode
    const invoiceUrl = `${origin}/invoice/${invoiceId}?pdf=1`;

    const pdfReqUrl =
      `https://api.html2pdf.app/v1/generate?apiKey=${API_KEY}` +
      `&url=${encodeURIComponent(invoiceUrl)}` +
      `&format=A4&printBackground=true&margin=10mm&delay=1600`;

    const response = await fetch(pdfReqUrl);
    if (!response.ok) throw new Error("Gagal render PDF");

    const pdfBytes = await response.arrayBuffer();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoiceId}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: true, message: err?.message ?? err },
      { status: 500 }
    );
  }
}
