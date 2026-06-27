import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { requireAdminFromRequest } from "@/lib/requireAdminFromRequest";

export async function GET(req: NextRequest) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.res;

  return NextResponse.json({
    name: guard.admin.email?.split("@")[0] || "Admin",
    email: guard.admin.email,
    role: "Super Admin",
  });
}
