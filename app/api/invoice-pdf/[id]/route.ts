import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const invoiceId = id?.trim();

  if (!invoiceId) {
    return NextResponse.json(
      { success: false, message: "Missing invoice ID" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true, invoiceId },
    { status: 200 }
  );
}
