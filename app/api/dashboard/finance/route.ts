import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheets";

// ... semua helpers (parseTanggal, normalizeStatus, dll) ...

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "current";

    // ... semua logic API ...

    return NextResponse.json({
      success: true,
      period,
      summary: { totalRevenue },
      methods: {
        transfer: { amount: transferAmount },
        cod: { amount: codAmount },
      },
      chart: [
        { name: "Transfer / QRIS", value: transferAmount, count: 0 },
        { name: "COD", value: codAmount, count: 0 },
      ],
      ...(insights && { insights }),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
