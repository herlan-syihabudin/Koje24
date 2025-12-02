export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import React from "react";
import InvoicePdf from "@/components/pdf/InvoicePdf";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const invoiceId = params.id;

  // 🔥 Ambil data invoice dari API yg sudah ada (bukan JSON)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const fetchUrl = `${baseUrl}/api/invoice/${invoiceId}`;

  const res = await fetch(fetchUrl, { cache: "no-store" });
  const result = await res.json();

  if (!res.ok || !result.success) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const data = result.data;

  // 🔥 Render komponen PDF
  const element = React.createElement(InvoicePdf, { data });
  const pdfBuffer = await pdf(element).toBuffer();

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=KOJE24-${invoiceId}.pdf`,
    },
  });
}
