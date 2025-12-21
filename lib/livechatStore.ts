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

  return full;
}

export async function getMessages(sid: string, afterTs?: number) {
  const all = (await kv.lrange(`chat:${sid}`, 0, -1)) as ChatMessage[];
  return afterTs ? all.filter(m => m.ts > afterTs) : all;
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
