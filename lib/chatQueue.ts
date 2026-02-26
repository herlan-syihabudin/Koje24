import { kv } from "@vercel/kv";

/**
 * QUEUE KEYS
 */
const QUEUE_KEY = "chat:queue";           // List untuk FIFO
const QUEUE_SET_KEY = "chat:queue:set";   // Set untuk anti duplicate
const QUEUE_META_KEY = "chat:queue:meta";

interface QueueItem {
  sid: string;
  timestamp: number;
  userAgent?: string;
  page?: string;
}

/**
 * Masukkan sid ke antrian (AMAN DARI RACE CONDITION)
 */
export async function enqueueChat(sid: string, metadata?: { userAgent?: string; page?: string }) {
  if (!sid) return false;

  // ✅ Atomic operation: cek dan set dalam 1 command
  const added = await kv.sadd(QUEUE_SET_KEY, sid);
  
  // Kalau return 0, berarti sudah ada di set
  if (added === 0) {
    console.log(`SID ${sid} already in queue set`);
    return false;
  }

  // Kalau berhasil, tambahkan ke queue list
  const queueItem: QueueItem = {
    sid,
    timestamp: Date.now(),
    ...metadata
  };

  await kv.rpush(QUEUE_KEY, JSON.stringify(queueItem));
  await kv.expire(QUEUE_KEY, 60 * 60 * 24);
  await kv.expire(QUEUE_SET_KEY, 60 * 60 * 24);
  
  // Update stats
  await kv.hincrby(QUEUE_META_KEY, "total_enqueued", 1);
  await kv.hset(QUEUE_META_KEY, { last_enqueue: Date.now() });
  
  return true;
}

/**
 * Ambil 1 sid paling depan (FIFO)
 */
export async function dequeueChat(): Promise<QueueItem | null> {
  const item = await kv.lpop(QUEUE_KEY);
  if (!item) return null;
  
  try {
    const parsed = typeof item === 'string' ? JSON.parse(item) : item;
    
    // ✅ Hapus juga dari set
    await kv.srem(QUEUE_SET_KEY, parsed.sid);
    
    // Update stats
    await kv.hincrby(QUEUE_META_KEY, "total_dequeued", 1);
    await kv.hset(QUEUE_META_KEY, { last_dequeue: Date.now() });
    
    return parsed;
  } catch {
    // Fallback untuk data lama
    const sid = String(item);
    await kv.srem(QUEUE_SET_KEY, sid);
    return { sid, timestamp: Date.now() } as QueueItem;
  }
}

/**
 * Hapus sid dari queue
 */
export async function removeFromQueue(sid: string): Promise<boolean> {
  if (!sid) return false;
  
  // ✅ Hapus dari set dulu
  await kv.srem(QUEUE_SET_KEY, sid);
  
  // Hapus dari list (perlu scan karena list)
  const items = await kv.lrange(QUEUE_KEY, 0, -1);
  let removed = false;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const parsed = JSON.parse(String(item));
      if (parsed.sid === sid) {
        await kv.lrem(QUEUE_KEY, 1, item);
        removed = true;
        break;
      }
    } catch {
      if (String(item) === sid) {
        await kv.lrem(QUEUE_KEY, 1, item);
        removed = true;
        break;
      }
    }
  }
  
  return removed;
}

/**
 * Cek apakah sid sudah di queue
 */
export async function isInQueue(sid: string): Promise<boolean> {
  if (!sid) return false;
  
  // ✅ Cek di set (O(1) super cepat!)
  const exists = await kv.sismember(QUEUE_SET_KEY, sid);
  return exists === 1;
}

/**
 * Posisi sid di antrian (1-based)
 */
export async function getQueuePosition(sid: string): Promise<number | null> {
  if (!sid) return null;

  // Cek dulu di set
  const exists = await isInQueue(sid);
  if (!exists) return null;

  // Cari posisi di list
  const items = await kv.lrange(QUEUE_KEY, 0, -1);
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const parsed = JSON.parse(String(item));
      if (parsed.sid === sid) return i + 1;
    } catch {
      if (String(item) === sid) return i + 1;
    }
  }
  
  return null;
}

/**
 * Info antrian lengkap (untuk UI & Telegram)
 */
export async function getQueueInfo(sid: string) {
  const [position, total, metadata] = await Promise.all([
    getQueuePosition(sid),
    kv.llen(QUEUE_KEY),
    kv.hgetall(QUEUE_META_KEY)
  ]);

  // Estimasi waktu tunggu (asumsi 2 menit per chat)
  const estimatedWaitMinutes = position ? position * 2 : 0;

  return {
    position,
    total: Number(total || 0),
    estimatedWaitMinutes,
    metadata: metadata || {},
  };
}

/**
 * Dapatkan stats queue
 */
export async function getQueueStats() {
  const metadata = await kv.hgetall(QUEUE_META_KEY);
  const [queueLength, setSize] = await Promise.all([
    kv.llen(QUEUE_KEY),
    kv.scard(QUEUE_SET_KEY)
  ]);

  return {
    ...metadata,
    queueLength: Number(queueLength || 0),
    uniqueSids: Number(setSize || 0),
    timestamp: Date.now()
  };
}

/**
 * Migrasi data lama ke format baru + set
 */
export async function migrateOldQueue() {
  const oldItems = await kv.lrange(QUEUE_KEY, 0, -1);
  if (oldItems.length === 0) return false;
  
  // Hapus set lama kalo ada
  await kv.del(QUEUE_SET_KEY);
  
  // Migrasi satu per satu
  for (const item of oldItems) {
    let sid: string;
    
    try {
      const parsed = JSON.parse(String(item));
      sid = parsed.sid;
    } catch {
      sid = String(item);
    }
    
    // Tambah ke set
    await kv.sadd(QUEUE_SET_KEY, sid);
  }
  
  return true;
}
