import { kv } from "@vercel/kv";

/**
 * QUEUE KEY
 * - isi: list of sessionId (sid)
 */
const QUEUE_KEY = "chat:queue";

/**
 * Masukkan sid ke antrian (anti duplikat).
 * Aman dipanggil berkali-kali.
 */
export async function enqueueChat(sid: string) {
  if (!sid) return;

  // Anti duplicate: cek dulu sudah ada belum
  const exists = await kv.lpos(QUEUE_KEY, sid);
  if (typeof exists === "number") return; // sudah ada

  await kv.rpush(QUEUE_KEY, sid);
  // optional TTL untuk key queue (biar gak numpuk kalau lama tidak dipakai)
  await kv.expire(QUEUE_KEY, 60 * 60 * 24); // 24 jam
}

/**
 * Ambil 1 sid paling depan (FIFO) dan keluarkan dari queue.
 */
export async function dequeueChat(): Promise<string | null> {
  const sid = await kv.lpop<string>(QUEUE_KEY);
  return sid || null;
}

/**
 * Lihat sid paling depan TANPA mengeluarkan.
 */
export async function peekQueue(): Promise<string | null> {
  const sid = await kv.lindex<string>(QUEUE_KEY, 0);
  return sid || null;
}

/**
 * Panjang antrian
 */
export async function getQueueLength(): Promise<number> {
  const n = await kv.llen(QUEUE_KEY);
  return Number(n || 0);
}

/**
 * Hapus sid tertentu dari queue (kalau user batal / closed / error)
 */
export async function removeFromQueue(sid: string) {
  if (!sid) return;
  // remove semua occurrence (kalau ada)
  await kv.lrem(QUEUE_KEY, 0, sid);
}
