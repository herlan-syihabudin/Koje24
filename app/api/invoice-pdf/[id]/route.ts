import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import InvoicePdf from "@/components/pdf/InvoicePdf";
import invoices from "@/data/invoices.json";

export const dynamic = "force-dynamic"; // ⬅️ biar gak error edge runtime

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const invoiceId = params.id;
  const data = invoices.find((i) => i.invoiceId === invoiceId);

  if (!data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const pdfBuffer = await pdf(<InvoicePdf data={data} />).toBuffer();

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=KOJE24-${invoiceId}.pdf`,
    },
  });
}
