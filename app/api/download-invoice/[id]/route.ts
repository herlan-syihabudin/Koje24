import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string }}) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ success: false, message: "Missing invoice ID" }, { status: 400 });
  }

  try {
    // sementara dummy response dulu biar deploy sukses
    return NextResponse.json({ success: true, invoiceId: id });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
