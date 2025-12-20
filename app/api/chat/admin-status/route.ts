import { NextResponse } from "next/server";
import { getAdminStatus } from "@/lib/adminStatus";

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: getAdminStatus(), // "online" | "offline"
  });
}
