import { kv } from "@vercel/kv";

/* =====================
   TYPES
===================== */
export type ChatMessage = {
  id: string;
  sid: string;
  role: "user" | "admin";
  text: string;
  ts: number;
};

export type SessionStatus = "INIT" | "ACTIVE" | "CLOSED";

/* =====================
   UTIL
===================== */
function genId() {
  return crypto.randomUUID();
}

/* =====================
   MESSAGE
===================== */
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

  // ⭐ session terakhir aktif (untuk telegram reply)
  await setLastActiveSessionId(sid);

  return full;
}

export async function getMessages(sid: string, afterTs?: number) {
  const all = (await kv.lrange(`chat:${sid}`, 0, -1)) as ChatMessage[];
  return afterTs ? all.filter((m) => m.ts > afterTs) : all;
}

/* =====================
   SESSION TRACKING
===================== */
export async function setLastActiveSessionId(sid: string) {
  await kv.set("chat:lastSession", sid, { ex: 60 * 60 });
}

export async function getLastActiveSessionId(): Promise<string | null> {
  return (await kv.get<string>("chat:lastSession")) || null;
}

/* =====================
   ADMIN STATUS
===================== */
export async function setAdminActive() {
  await kv.set("admin:lastActive", Date.now(), { ex: 120 });
}

export async function getAdminStatus() {
  const ts = (await kv.get<number>("admin:lastActive")) || 0;
  return Date.now() - ts < 2 * 60 * 1000 ? "online" : "offline";
}

/* =====================
   TYPING INDICATOR
===================== */
export async function setAdminTyping(ttlMs = 5000) {
  if (ttlMs <= 0) {
    await kv.del("admin:typing");
    return;
  }

  await kv.set("admin:typing", 1, {
    ex: Math.ceil(ttlMs / 1000),
  });
}

export async function isAdminTyping() {
  return Boolean(await kv.get("admin:typing"));
}

/* =====================
   SESSION STATUS (LEGACY SUPPORT)
===================== */
export async function closeSession(sid: string) {
  if (!sid) return;

  await kv.hset(`chat:session:${sid}`, {
    status: "CLOSED",
    closedAt: Date.now(),
  });

  await kv.expire(`chat:session:${sid}`, 60 * 60 * 24);
}

export async function isSessionClosed(sid: string): Promise<boolean> {
  if (!sid) return false;

  const status = await kv.hget<string>(
    `chat:session:${sid}`,
    "status"
  );

  return status === "CLOSED";
}

/* =====================
   SESSION STATUS V2 (PRO)
===================== */
export async function setSessionStatus(
  sid: string,
  status: SessionStatus
) {
  if (!sid) return;

  const payload: Record<string, any> = {
    status,
    updatedAt: Date.now(),
  };

  if (status === "ACTIVE") payload.startedAt = Date.now();
  if (status === "CLOSED") payload.closedAt = Date.now();

  await kv.hset(`chat:session:${sid}`, payload);
  await kv.expire(`chat:session:${sid}`, 60 * 60 * 24);
}

export async function getSessionStatus(
  sid: string
): Promise<SessionStatus> {
  if (!sid) return "INIT";

  const status = await kv.hget<string>(
    `chat:session:${sid}`,
    "status"
  );

  if (status === "ACTIVE" || status === "CLOSED") {
    return status;
  }

  return "INIT";
}

/* =====================
   SESSION METADATA (PRO)
===================== */
export async function initSession(
  sid: string,
  data: {
    name: string;
    phone?: string;
    topic?: string;
    page?: string;
    email?: string;
  }
) {
  if (!sid) return;

  const exists = await kv.exists(`chat:session:${sid}`);
  if (exists) return; // ❗ jangan overwrite

  await kv.hset(`chat:session:${sid}`, {
    sid,
    name: data.name || "Guest",
    phone: data.phone || "-",
    email: data.email || "-",
    topic: data.topic || "-",
    page: data.page || "-",
    status: "INIT",
    startedAt: Date.now(),
  });

  await kv.expire(`chat:session:${sid}`, 60 * 60 * 24);
}
