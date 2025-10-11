import crypto from "crypto";
import { getRedisClient } from "./redisClient";
import { redis } from "bun";
export { getRedisClient };

export async function createShareLink(spaceId: string = ""): Promise<string> {
  const redis = await getRedisClient();

  const hash = crypto.randomBytes(6).toString("hex");

  await redis.set(hash, spaceId, { EX: 60 * 60 * 24 });

  return `http://localhost:3000/join?sp=${spaceId}?t=${hash}`;
}

export const getSpace=async (token:string)=>{
  const redisClient=await getRedisClient();
  const doesExist=await redisClient.exists(token);

  return doesExist;
}