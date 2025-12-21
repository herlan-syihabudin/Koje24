// lib/livechatStore.ts

export type ChatMessage = {
  id: string;
  sid: string;
  role: "user" | "admin";
  text: string;
  ts: number;
};

// ================= MESSAGE STORE =================

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

// dipanggil setiap admin reply dari Telegram
export function setAdminActive() {
  lastActive = Date.now();
}

// status admin berdasarkan aktivitas terakhir
export function getAdminStatus() {
  return Date.now() - lastActive < 2 * 60 * 1000
    ? "online"
    : "offline";
}

// ================= TYPING INDICATOR =================

let adminTypingUntil = 0;

/**
 * Set admin sedang mengetik
 * @param ttlMs durasi typing (default 5 detik)
 */
export function setAdminTyping(ttlMs = 5000) {
  adminTypingUntil = Date.now() + ttlMs;
}

// cek apakah admin masih dalam status mengetik
export function isAdminTyping() {
  return Date.now() < adminTypingUntil;
}
