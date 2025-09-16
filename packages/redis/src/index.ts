import crypto from "crypto";
import { getRedisClient } from "./redisClient";

// Export the redis client getter if other modules need it
export { getRedisClient };

/**
 * Creates or retrieves a share link.
 *
 * @param userId - The user id to store (only used when creating a new link).
 * @param hashed - If provided, the function returns the stored userId for this hash.
 * @returns A share URL string or the userId (when `hashed` is provided).
 */
export async function createShareLink(
  userId: string = "",
  hashed: string = ""
): Promise<string> {
  const redis = await getRedisClient();

  // If a hash was provided, treat it as a lookup
  if (hashed.trim() !== "") {
    const exists = await redis.exists(hashed);
    if (!exists) {
      throw new Error("User not found. Check the link and try again!");
    }
    const result = await redis.get(hashed);
    return result ?? "";
  }

  // Otherwise, create a new share link
  if (!userId) {
    throw new Error("userId must be provided when creating a new share link");
  }

  const hash = crypto.randomBytes(6).toString("hex");

  // Store plain string userId for easier retrieval
  await redis.set(hash, userId, { EX: 60 * 60 * 24 }); // 24 hours

  return `http://localhost:3000/share?h=${hash}`;
}

/**
 * Retrieves the streamer/user id from a hashed share id.
 *
 * @param hashedId - The hash from the share link.
 * @returns The stored userId as a string.
 */
export async function getStreamerId(hashedId: string): Promise<string> {
  const redis = await getRedisClient();
  const trimmed = hashedId.trim();

  if (!trimmed) {
    throw new Error("id not provided");
  }

  const exists = await redis.exists(trimmed);
  if (!exists) {
    throw new Error("User not found. Check the link and try again!");
  }

  const result = await redis.get(trimmed);
  if (!result) {
    throw new Error("Stored userId is empty or missing");
  }

  return result;
}
