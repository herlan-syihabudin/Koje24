import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import React from "react"; // ⬅️ WAJIB
import InvoicePdf from "@/components/pdf/InvoicePdf";
import invoices from "../../../../data/invoices.json";


export const dynamic = "force-dynamic"; // biar boleh akses runtime server full

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const invoiceId = params.id;
  const data = invoices.find((i) => i.invoiceId === invoiceId);

  if (!data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const element = React.createElement(InvoicePdf, { data }); // ⬅️ penting
  const pdfBuffer = await pdf(element).toBuffer();

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=KOJE24-${invoiceId}.pdf`,
    },
  });
}
