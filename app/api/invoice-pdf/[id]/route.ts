import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // biar tidak ke-cache oleh Vercel

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) throw new Error("Invoice ID tidak valid");

    // 🟢 Domain stabil untuk PDF
    const base =
      process.env.NEXT_PUBLIC_BASE_URL || "https://webkoje-cacs.vercel.app";

    // 🟢 Gunakan mode print biar tampilan PDF bersih & tidak tampil tombol download
    const invoiceUrl = `${base}/invoice/${id}?print=1`;

    // 🟢 Request ke HTML2PDF API
    const pdfReqUrl = `https://api.html2pdf.app/v1/generate?apiKey=${
      process.env.HTML2PDF_KEY
    }&url=${encodeURIComponent(
      invoiceUrl
    )}&format=A4&printBackground=true&margin=12mm&delay=1200`;

    const result = await fetch(pdfReqUrl);

    if (!result.ok) {
      const errText = await result.text().catch(() => "Unknown PDF error");
      throw new Error("Gagal generate PDF — " + errText);
    }

    const pdf = await result.arrayBuffer();

    // 🟢 Return PDF stream
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${id}.pdf"`,
      },
    });
  } catch (err: any) {
    // 🛡 Anti-crash — kembalikan error JSON
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        detail: err?.message ?? err,
      },
      { status: 500 }
    );
  }
}
