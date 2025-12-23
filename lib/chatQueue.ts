import { kv } from "@vercel/kv";

/**
 * Queue chat (FIFO)
 */

export async function enqueueChat(sid: string) {
  await kv.rpush("queue:chat", sid);
}

export async function dequeueChat() {
  return await kv.lpop<string>("queue:chat");
}

export async function getQueuePosition(sid: string) {
  const list = (await kv.lrange("queue:chat", 0, -1)) as string[];
  const idx = list.indexOf(sid);
  return idx === -1 ? null : idx + 1;
}
