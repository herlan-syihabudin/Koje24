import { kv } from "@vercel/kv";

const QUEUE_KEY = "livechat:queue";
const ACTIVE_KEY = "livechat:active";

export type QueueItem = {
  sessionId: string;
  ts: number;
};

export async function enqueue(sessionId: string) {
  await kv.rpush(QUEUE_KEY, { sessionId, ts: Date.now() });
}

export async function getQueue() {
  return (await kv.lrange(QUEUE_KEY, 0, -1)) as QueueItem[];
}

export async function activateNext() {
  const next = await kv.lpop(QUEUE_KEY);
  if (!next) return null;
  await kv.set(ACTIVE_KEY, next);
  return next;
}

export async function getActive() {
  return (await kv.get(ACTIVE_KEY)) as QueueItem | null;
}

export async function closeActive() {
  await kv.del(ACTIVE_KEY);
}
