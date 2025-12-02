import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // mencegah cache runtime

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id?.trim();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing invoice ID" },
      { status: 400 }
    );
  }

  // sementara dummy agar lolos deploy
  return NextResponse.json(
    { success: true, invoiceId: id },
    { status: 200 }
  );
}
