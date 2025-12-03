import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) throw new Error("Invoice ID tidak valid");

    const base =
      process.env.NEXT_PUBLIC_BASE_URL || "https://webkoje-cacs.vercel.app";

    // ⬇️ Gunakan mode pdf agar elemen non-PDF disembunyikan
    const invoiceUrl = `${base}/invoice/${id}?pdf=1`;

    const pdfReqUrl = `https://api.html2pdf.app/v1/generate?apiKey=${
      process.env.HTML2PDF_KEY
    }&url=${encodeURIComponent(
      invoiceUrl
    )}&format=A4&printBackground=true&margin=10mm&delay=900`;

    const result = await fetch(pdfReqUrl);
    if (!result.ok) {
      const errText = await result.text().catch(() => "Unknown PDF error");
      throw new Error("Gagal generate PDF — " + errText);
    }

    const pdf = await result.arrayBuffer();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${id}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to generate PDF", detail: err?.message ?? err },
      { status: 500 }
    );
  }
}
