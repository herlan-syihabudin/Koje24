import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id?.trim();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing invoice ID" },
      { status: 400 }
    );
  }

  // Untuk sementara dummy supaya build lolos
  return NextResponse.json(
    { success: true, invoiceId: id },
    { status: 200 }
  );
}
