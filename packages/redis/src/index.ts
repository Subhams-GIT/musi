import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { getRedisClient } from "./redisClient";
//@ts-ignore
import jwt from "jsonwebtoken";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath });
type linkProps = {
  link: string;
};
export async function createShareLink(
  spaceId: string,
  creatorId: string,
): Promise<string> {
  const redis = await getRedisClient();
  console.log(process.env.NEXT_AUTH_SECRET);
  const hash = jwt.sign(
    { spaceId: spaceId, creatorId },
    process.env.NEXT_AUTH_SECRET || "",
  );
  // const token=crypto.randomUUID();
  await redis.set(hash, spaceId, { EX: 60 * 60 * 24 });

  return `http://localhost:3000/spaces/join?t=${hash}`;
}

export const getSpace = async (token: string) => {
  const redisClient = await getRedisClient();
  const doesExist = await redisClient.exists(token);

  return doesExist;
};
export { getRedisClient };
