import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("id")?.trim();

    if (!invoiceId) {
      return NextResponse.json({
        success: false,
        message: "Parameter ?id= kosong",
      });
    }

    // Call endpoint resmi invoice
    const res = await fetch(`${req.nextUrl.origin}/api/invoice/${invoiceId}`);
    const json = await res.json();

    if (!json?.success || !json?.data) {
      return NextResponse.json({
        success: false,
        message: json?.message ?? "Invoice tidak ditemukan",
      });
    }

    const d = json.data;

    return NextResponse.json({
      success: true,
      invoiceId: d.invoiceId,
      status: d.status ?? "Unknown",
      paymentLabel: d.paymentLabel ?? "-",
      timestamp: d.timestamp ?? "",
      invoiceUrl: d.invoiceUrl ?? "",
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Gagal mengambil status invoice",
      detail: err?.message ?? err,
    });
  }
}
