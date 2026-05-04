import { NextResponse } from "next/server";

const dummySales = [
  { id: "golden-detox", sold_this_week: 87 },
  { id: "green-revive", sold_this_week: 65 },
  { id: "red-vitality", sold_this_week: 93 },
  { id: "yellow-immunity", sold_this_week: 71 },
  { id: "sunrise-boost", sold_this_week: 52 },
  { id: "lemongrass-fresh", sold_this_week: 48 },
];

export async function GET() {
  return NextResponse.json(dummySales);
}
