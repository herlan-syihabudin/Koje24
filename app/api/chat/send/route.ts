import { NextRequest, NextResponse } from "next/server";
import { enqueueChat } from "@/lib/chatQueue"; // queue logic lo

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name = "Guest",
      phone = "-",
      topic = "-",
      message,
      sessionId,
      page = "-",
    } = body || {};

    if (!message?.trim() || !sessionId) {
      return NextResponse.json({
        ok: false,
        reason: "invalid_payload",
      });
    }

    // 🔐 SIMPAN & MASUK QUEUE
    const status = await enqueueChat({
      sessionId,
      name,
      phone,
      topic,
      message,
      page,
    });
    // status: "active" | "queued"

    // ⚠️ PENTING: SELALU 200 OK
    return NextResponse.json({
      ok: true,
      status, // dipakai frontend utk UX
    });
  } catch (err) {
    console.error("CHAT SEND ERROR:", err);

    // ❗ Kalau server error baru error
    return NextResponse.json({
      ok: false,
      reason: "server_error",
    });
  }
}
