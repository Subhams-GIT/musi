import { Queue, Worker, Job } from "bullmq";
import type { RedisClientType } from "redis";
import type { PrismaClient } from "@repo/db";
import type { WebSocket } from "ws";
import { checkforurl } from "./util.js";

type User = {
  userId: string;
  admin: boolean;
  ws: WebSocket;
  token: string;
};

const connection = {
  username: process.env.REDIS_USERNAME || "redis",
  password: process.env.REDIS_PASSWORD || "",
  host: process.env.REDIS_HOST || "",
  port: parseInt(process.env.REDIS_PORT || "") || 6379,
};

export class streamManager {
  private static instance: streamManager;
  public prisma!: PrismaClient;
  public redisClient?: RedisClientType;
  public queue: Queue;
  public worker: Worker;
  private roomSockets: Map<string, User[]> = new Map();

  private constructor() {
    this.queue = new Queue("stream-queue", { connection });

    this.worker = new Worker(
      "stream-queue",
      async (job: Job) => this.processJob(job),
      { connection }
    );

    this.worker.on("completed", (job: Job) => {
      console.log(`Job ${job.id} completed: ${job.name}`);
    });

    this.worker.on("failed", (job: Job | undefined, err: Error) => {
      console.error(`Job ${job?.id} failed: ${job?.name}`, err);
    });
  }

  static getInstance() {
    if (!streamManager.instance) {
      streamManager.instance = new streamManager();
    }
    return streamManager.instance;
  }

  private async getPrisma() {
    if (!this.prisma) {
      const { default: prisma } = await import("@repo/db");
      this.prisma = prisma;
    }
    return this.prisma;
  }

  private async getRedisClient() {
  if (!this.redisClient) {
    const { default: getRedisClient } = await import("@repo/redis");
    this.redisClient = await getRedisClient.default();
  }
  return this.redisClient;
}


  async processJob(job: Job) {
    const { data, name } = job;
    switch (name) {
      case "createRoom":
        await this.createRoom(data.roomId, data.userId, data.ws, data.token);
        break;
      case "joinRoom":
        await this.joinRoom(data.roomId, data.userId, data.ws, data.token);
        break;
      case "vote":
        await this.vote(data.streamId, data.vote, data.userId);
        break;
      case "addStream":
        await this.addStream(data.streamUrl, data.userId, data.streamerId);
        break;
      case "removeStream":
        await this.removeStream(data.streamId, data.userId);
        break;
    }
  }

  async joinRoom(roomId: string, userId: string, ws: WebSocket, token: string) {
    try {
      const redis = await this.getRedisClient();
      const exists = await redis.exists(roomId);
      if (!exists) throw new Error("Room not found");

      const user: User = { userId, admin: false, ws, token };
      if (!this.roomSockets.has(roomId)) {
        this.roomSockets.set(roomId, []);
      }
      this.roomSockets.get(roomId)!.push(user);

      const prisma = await this.getPrisma();
      const userDetails = await prisma.user.findFirst({
        where: { id: userId },
      });
      if (!userDetails) throw new Error("User not found");

      return { type: "joined stream", roomId, userDetails };
    } catch (e) {
      console.error(e);
    }
  }

  async createRoom(roomId: string, userId: string, ws: WebSocket, token: string) {
    try {
      const redis = await this.getRedisClient();
      const exists = await redis.exists(roomId);
      if (exists) throw new Error("Room already exists");

      await redis.hSet(roomId, {
        admin: userId,
        createdAt: Date.now().toString(),
        isLive: "true",
      });

      this.roomSockets.set(roomId, [{ userId, admin: true, ws, token }]);
      return { type: "room created", roomId };
    } catch (error) {
      console.error(error);
    }
  }

  async addStream(streamUrl: string, userId: string, streamerId: string) {
    if (!checkforurl(streamUrl)) {
      throw new Error("Stream URL not correct!");
    }
    try {
      const redis = await this.getRedisClient();
      const exists = await redis.exists(streamerId);
      if (!exists) throw new Error("You don’t belong here!");

      const prisma = await this.getPrisma();
      const user = await prisma.user.findFirst({ where: { id: userId } });
      if (!user) throw new Error("User not found");

      return { type: "song added in stream", streamUrl, user };
    } catch (error) {
      console.error(error);
    }
  }

  async vote(streamId: string, vote: "up" | "down", userId: string) {
    try {
      const redis = await this.getRedisClient();
      const exists = await redis.exists(userId);
      if (!exists) throw new Error("User not found in redis");

      const prisma = await this.getPrisma();
      const user = await prisma.user.findFirst({ where: { id: userId } });
      if (!user) throw new Error("User not found");

      return { type: "voted", vote, user };
    } catch (e) {
      console.error(e);
    }
  }

  async removeStream(streamId: string, userId: string) {
    try {
      const redis = await this.getRedisClient();
      const exists = await redis.exists(userId);
      if (!exists) throw new Error("User not found in redis");

      const prisma = await this.getPrisma();
      const user = await prisma.user.findFirst({ where: { id: userId } });
      if (!user) throw new Error("User not found");

      return { type: "removestream", streamId, user };
    } catch (e) {
      console.error(e);
    }
  }
}
