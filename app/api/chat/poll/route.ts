import { getMessages } from "@/lib/livechatStore";
import { getAdminStatus } from "@/lib/adminStatus";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sid = String(searchParams.get("sid") || "").trim();
  const after = Number(searchParams.get("after") || "0");

  if (!sid) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const allMessages = await getMessages(
    sid,
    after > 0 ? after : undefined
  );

  // 🔒 ADMIN ONLY (ANTI DOUBLE)
  const messages = allMessages.filter((m) => m.role === "admin");

  return NextResponse.json({
    ok: true,
    messages,
    adminOnline: getAdminStatus() === "online",
  });
}
