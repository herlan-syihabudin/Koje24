import { kv } from "@vercel/kv";

export type ChatMessage = {
  id: string;
  sid: string;
  role: "user" | "admin";
  text: string;
  ts: number;
};

function genId() {
  return crypto.randomUUID();
}

// ================= MESSAGE =================

export async function addMessage(
  sid: string,
  msg: Omit<ChatMessage, "id" | "sid">
) {
  const full: ChatMessage = {
    ...msg,
    id: genId(),
    sid,
  };

  await kv.rpush(`chat:${sid}`, full);
  await kv.expire(`chat:${sid}`, 60 * 60 * 24);

  // ⭐ INI KUNCI UTAMA
  await setLastActiveSessionId(sid);

  return full;
}

export async function getMessages(sid: string, afterTs?: number) {
  const all = (await kv.lrange(`chat:${sid}`, 0, -1)) as ChatMessage[];
  return afterTs ? all.filter(m => m.ts > afterTs) : all;
}

// ================= SESSION AKTIF =================

// ⭐ SIMPAN SESSION TERAKHIR
export async function setLastActiveSessionId(sid: string) {
  await kv.set("chat:lastSession", sid, { ex: 60 * 60 });
}

// ⭐ AMBIL SESSION TERAKHIR
export async function getLastActiveSessionId(): Promise<string | null> {
  return (await kv.get<string>("chat:lastSession")) || null;
}

// ================= ADMIN STATUS =================

export async function setAdminActive() {
  await kv.set("admin:lastActive", Date.now(), { ex: 120 });
}

export async function getAdminStatus() {
  const ts = (await kv.get<number>("admin:lastActive")) || 0;
  return Date.now() - ts < 2 * 60 * 1000 ? "online" : "offline";
}

// ================= TYPING =================

export async function setAdminTyping(ttlMs = 5000) {
  await kv.set("admin:typing", 1, {
    ex: Math.ceil(ttlMs / 1000),
  });
}

export async function isAdminTyping() {
  return Boolean(await kv.get("admin:typing"));
}
// ================= SESSION STATUS (CLOSE CHAT) =================

// 🔒 Tandai session sebagai CLOSED
export async function closeSession(sid: string) {
  if (!sid) return;

  await kv.hset(`chat:session:${sid}`, {
    status: "closed",
    closedAt: Date.now(),
  });

  // expire biar KV bersih otomatis
  await kv.expire(`chat:session:${sid}`, 60 * 60 * 24);
}

// 🔍 Cek apakah session sudah CLOSED
export async function isSessionClosed(sid: string): Promise<boolean> {
  if (!sid) return false;

  const status = await kv.hget<string>(
    `chat:session:${sid}`,
    "status"
  );

  return status === "closed";
}
// ================= SESSION STATUS V2 (PROFESSIONAL) =================

export type SessionStatus = "INIT" | "ACTIVE" | "CLOSED";

/**
 * Set status session (upgrade version)
 * Tidak mengganggu closeSession lama
 */
export async function setSessionStatus(
  sid: string,
  status: SessionStatus
) {
  if (!sid) return;

  await kv.hset(`chat:session:${sid}`, {
    status,
    updatedAt: Date.now(),
  });

  await kv.expire(`chat:session:${sid}`, 60 * 60 * 24);
}

/**
 * Get status session
 * Default: INIT
 * Kompatibel dengan closeSession lama
 */
export async function getSessionStatus(
  sid: string
): Promise<SessionStatus> {
  if (!sid) return "INIT";

  const status = await kv.hget<string>(
    `chat:session:${sid}`,
    "status"
  );

  // kompatibel dengan closeSession lama
  if (status === "closed") return "CLOSED";

  if (status === "ACTIVE" || status === "CLOSED") {
    return status;
  }

  return "INIT";
}
