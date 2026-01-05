import { NextResponse } from "next/server";
import { getOrders } from "@/lib/data/orders"; // nanti kita buat

export async function GET() {
  const stats = await getOrders(); // sementara dummy dulu
  return NextResponse.json(stats);
}
