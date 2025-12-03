import { NextRequest } from "next/server";  // <- NextResponse dihapus

export const runtime = "edge";

const API_KEY = process.env.HTML2PDF_KEY || "demo";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const invoiceUrl = `${req.nextUrl.origin}/invoice/${id}?print=1`;

    const pdfReqUrl = `https://api.html2pdf.app/v1/generate?apiKey=${API_KEY}&url=${encodeURIComponent(
      invoiceUrl
    )}&format=A4&printBackground=true&margin=10mm&delay=2500&waitFor=networkidle`;

    const result = await fetch(pdfReqUrl);
    if (!result.ok) throw new Error("Gagal generate PDF");

    const pdf = await result.arrayBuffer();

    // 🚀 Ganti NextResponse jadi Response agar TypeScript sesuai
    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${id}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("PDF error:", err);

    // 🚀 Ganti NextResponse.json juga
    return new Response(
      JSON.stringify({
        error: "Failed to generate PDF",
        detail: err?.message ?? err,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
