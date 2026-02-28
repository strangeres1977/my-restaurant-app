import { createClient } from "redis";

let client;

async function getRedis() {
  if (!process.env.REDIS_URL) return null;

  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) => console.error("Redis error:", err));
  }

  if (!client.isOpen) await client.connect();
  return client;
}

export async function rateLimit({ key, windowSeconds = 60, max = 5 }) {
  const redis = await getRedis();
  if (!redis) return { ok: true, remaining: null };

  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const k = `rl:${key}:${bucket}`;

  const count = await redis.incr(k);
  if (count === 1) await redis.expire(k, windowSeconds);

  return { ok: count <= max, remaining: Math.max(0, max - count) };
}
