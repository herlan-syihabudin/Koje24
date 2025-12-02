import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    page.drawText(`Invoice ID: ${id}`, { x: 50, y: 790, size: 24, color: rgb(0, 0, 0) });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${id}.pdf"`
      }
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to generate PDF", detail: err },
      { status: 500 }
    );
  }
}
