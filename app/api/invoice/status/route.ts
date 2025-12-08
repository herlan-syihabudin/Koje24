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

    // CALL invoice API – bukan import module
    const res = await fetch(
      `${req.nextUrl.origin}/api/invoice/${invoiceId}`,
      { method: "GET" }
    );

    const json = await res.json();

    if (!json?.success) {
      return NextResponse.json({
        success: false,
        message: json?.message ?? "Invoice tidak ditemukan",
      });
    }

    return NextResponse.json({
      success: true,
      status: json.data?.status ?? "Unknown",
      paymentLabel: json.data?.paymentLabel ?? "-",
      timestamp: json.data?.timestamp ?? "",
      invoiceUrl: json.data?.invoiceUrl ?? "",
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Gagal mengambil status invoice",
      detail: err?.message ?? err,
    });
  }
}
