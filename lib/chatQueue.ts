import { kv } from "@vercel/kv";

/**
 * QUEUE KEY
 */
const QUEUE_KEY = "chat:queue";

/**
 * Masukkan sid ke antrian (anti duplikat)
 */
export async function enqueueChat(sid: string) {
  if (!sid) return;

  const exists = await kv.lpos(QUEUE_KEY, sid);
  if (typeof exists === "number") return;

  await kv.rpush(QUEUE_KEY, sid);
  await kv.expire(QUEUE_KEY, 60 * 60 * 24);
}

/**
 * Ambil 1 sid paling depan (FIFO)
 */
export async function dequeueChat(): Promise<string | null> {
  const sid = await kv.lpop(QUEUE_KEY);
  return typeof sid === "string" ? sid : null;
}

/**
 * Lihat sid paling depan TANPA mengeluarkan
 */
export async function peekQueue(): Promise<string | null> {
  const sid = await kv.lindex(QUEUE_KEY, 0);
  return typeof sid === "string" ? sid : null;
}

/**
 * Panjang antrian
 */
export async function getQueueLength(): Promise<number> {
  const n = await kv.llen(QUEUE_KEY);
  return Number(n || 0);
}

/**
 * Hapus sid dari queue
 */
export async function removeFromQueue(sid: string) {
  if (!sid) return;
  await kv.lrem(QUEUE_KEY, 0, sid);
}
/**
 * Ambil posisi sid di antrian (1-based)
 */
export async function getQueuePosition(
  sid: string
): Promise<number | null> {
  if (!sid) return null;

  const list = await kv.lrange(QUEUE_KEY, 0, -1);
  const idx = list.findIndex((x) => x === sid);

  return idx === -1 ? null : idx + 1;
}
