import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id?.trim();

  return NextResponse.json(
    { success: true, invoiceId: id },
    { status: 200 }
  );
}
