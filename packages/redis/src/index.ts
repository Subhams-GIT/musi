import crypto from "crypto";
import { getRedisClient } from "./redisClient.js";
// export * from "./redisClient";
export default getRedisClient;
export async function createShareLink(userId = "", hashed = "") {
  const redis = await getRedisClient();
  if (hashed != "") {
    console.log(JSON.stringify(hashed));

    if (await redis.exists(hashed)) {
      // console.log(hashed)
      const result = await redis.get(hashed);
      // console.log(result);
      return result;
    } else {
      throw new Error("user not found check the link and try again !");
    }
  }

  const hash = crypto.randomBytes(6).toString("hex");

  await redis.set(hash, JSON.stringify(userId), { EX: 60 * 60 * 24 });

  return `http://localhost:3000/share?h=${hash}`;
}
export async function getstreamerid(hashedid: string) {
  const redis = await getRedisClient();
  const hashed = hashedid.trim();
  if (hashed.length == 0) {
    throw new Error("id not provided");
  }
  if (await redis.exists(hashed)) {
    const result = await redis.get(hashed);
    return result;
  } else {
    return new Error("user not found check the link and try again !");
  }
}
