// lib/livechatStore.ts
export type ChatMessage = {
  id: string;
  sid: string; // sessionId
  role: "user" | "admin";
  text: string;
  ts: number; // Date.now()
};

const mem = new Map<string, ChatMessage[]>(); // fallback DEV only

function genId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * NOTE:
 * - In-memory hanya aman untuk development.
 * - Di production (Vercel), gunakan KV/Redis agar persist.
 */
export async function addMessage(sid: string, msg: Omit<ChatMessage, "id" | "sid">) {
  const full: ChatMessage = { ...msg, id: genId(), sid };

  // --- fallback memory ---
  const arr = mem.get(sid) ?? [];
  arr.push(full);
  mem.set(sid, arr);

  // --- optional: Vercel KV (kalau lu sudah setup) ---
  // Uncomment kalau sudah pasang @vercel/kv + env KV
  /*
  const { kv } = await import("@vercel/kv");
  await kv.rpush(`chat:${sid}`, full);
  // optional TTL:
  await kv.expire(`chat:${sid}`, 60 * 60 * 24 * 3); // 3 hari
  */

  return full;
}

export async function getMessages(sid: string, afterTs?: number) {
  // --- fallback memory ---
  const arr = mem.get(sid) ?? [];
  const filtered = afterTs ? arr.filter((m) => m.ts > afterTs) : arr;

  // --- optional KV ---
  /*
  const { kv } = await import("@vercel/kv");
  const all = (await kv.lrange(`chat:${sid}`, 0, -1)) as ChatMessage[];
  const filtered = afterTs ? all.filter((m) => m.ts > afterTs) : all;
  */

  return filtered;
}
