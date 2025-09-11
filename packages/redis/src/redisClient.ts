import type { RedisClientType } from "redis";
import { createClient } from "redis";

let client:RedisClientType;

export async function getRedisClient() {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379"
    });
    client.on("error", (err:any) => console.error("Redis error:", err));
    await client.connect();
  }
  return client;
}