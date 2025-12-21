// lib/livechatStore.ts

export type ChatMessage = {
  id: string;
  sid: string;
  role: "user" | "admin";
  text: string;
  ts: number;
};

const mem = new Map<string, ChatMessage[]>();

function genId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function addMessage(
  sid: string,
  msg: Omit<ChatMessage, "id" | "sid">
) {
  const full: ChatMessage = { ...msg, id: genId(), sid };
  const arr = mem.get(sid) ?? [];
  arr.push(full);
  mem.set(sid, arr);
  return full;
}

export async function getMessages(sid: string, afterTs?: number) {
  const arr = mem.get(sid) ?? [];
  return afterTs ? arr.filter((m) => m.ts > afterTs) : arr;
}

// ================= ADMIN STATUS =================

let lastActive = 0;

export function setAdminActive() {
  lastActive = Date.now();
}

export function getAdminStatus() {
  return Date.now() - lastActive < 2 * 60 * 1000
    ? "online"
    : "offline";
}
