import { Queue, Worker, Job } from "bullmq";
import { createClient, type RedisClientType } from "redis";
import type { PrismaClient } from "@repo/db";
import type { WebSocket } from "ws";
import { checkforurl } from "./util.js";
import youtubesearchapi from 'youtube-search-api';


type User = {
  userId: string;
  admin: boolean;
};

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "") || 6379,
};


export class streamManager {
  private static instance: streamManager;
 
  public prisma!: PrismaClient;
  public redisClient?: RedisClientType;
  public queue: Queue;
  public worker: Worker;
  private roomSockets: Map<string, WebSocket[]> = new Map();
  private constructor() {
    this.queue = new Queue("stream-queue", { connection });

    this.worker = new Worker(
      "stream-queue",
    async (job:Job)=>this.processJob(job),
    {connection}
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

  private async getPrisma(): Promise<PrismaClient> {
    if (!this.prisma) {
     
      const { default: prisma } = await import("@repo/db");
      this.prisma = prisma;
    }
    return this.prisma;
  }

  
  private async getRedisClient(): Promise<RedisClientType> {
    if (!this.redisClient || !this.redisClient.isOpen) {
      if (this.redisClient && this.redisClient.isOpen) {
        await this.redisClient.disconnect();
      }
      this.redisClient = createClient({
        socket: {
          host: connection.host,
          port: connection.port,
        },
      });

      this.redisClient.on("error", (err) => {
        console.error("Redis Client Error", err);
      });

      await this.redisClient.connect();
    }
    return this.redisClient;
  }


  async processJob(job: Job){
    const { data, name } = job;
    switch (name) {
      case "createRoom":
        
        await this.createRoom(data.roomId, data.userId, data.ws);
        break;
      case "joinRoom":
        await this.joinRoom(data.roomId, data.userId, data.ws);
        break;
      case "vote":
        await this.vote(data.streamId, data.vote, data.userId);
        break;
      case "addStream":
       
        await this.addStream(data.streamUrl, data.userId, data.roomId);
        break;
      case "removeStream":
        await this.removeStream(data.streamId, data.userId);
        break;
    }
  }

 
async joinRoom(roomId: string, userId: string, ws: WebSocket) {
  try {
    const redis = await this.getRedisClient();

    let membersJson = await redis.get(roomId);
    let members = membersJson ? JSON.parse(membersJson) : [];

    const userExists = members.some((member: User) => member.userId === userId);
    if (userExists) {
      throw new Error("User already in the room");
    }

    
    const newUser: User = { userId, admin: false };
    members.push(newUser);

   
    await redis.set(roomId, JSON.stringify(members));

   
    if (!this.roomSockets.has(roomId)) {
      this.roomSockets.set(roomId, []);
    }
    this.roomSockets.get(roomId)!.push(ws);

    return { type: "joined stream", roomId, userId };
  } catch (e) {
    throw new Error(`Failed to join room ${e}`);
  }
}


async createRoom(roomId: string, userId: string, ws: WebSocket) {
  try {
    const redis = await this.getRedisClient();
    const exists = await redis.exists(roomId);
    if (exists) {
      throw new Error("Room already exists");
    }

    const newRoom: User[] = [{ userId, admin: true }];
    await redis.set(roomId, JSON.stringify(newRoom));

    this.roomSockets.set(roomId, [ws]);

    return { type: "room created", roomId };
  } catch (error) {
    throw new Error(`Failed to create room${error}`);
  }
}

async addStream(streamUrl: string, userId: string, roomId: string) {
  if (!checkforurl(streamUrl)) {
    throw new Error("Stream URL not correct!");
  }
  try {
    const redis = await this.getRedisClient();

    let membersJson = await redis.get(roomId);
    if (!membersJson) {
      throw new Error("Room does not exist");
    }
    
    let members = JSON.parse(membersJson);

    const userIsMember = members.some((member: User) => member.userId === userId);
    if (!userIsMember) {
      throw new Error("You are not a member of this room.");
    }

    const res = await youtubesearchapi.GetVideoDetails(streamUrl);
    return { type: "song added in stream", res };
  } catch (error) {
    console.error(error);
    throw new Error('Cannot add stream');
  }
}

  
  async vote(streamId: string, vote: "up" | "down", userId: string) {
    try {
      const redis = await this.getRedisClient();
      const userExistsInRedis = await redis.exists(userId);
      if (!userExistsInRedis) {
 
        throw new Error("User not found in the room.");
      }

      const prisma = await this.getPrisma();
      const user = await this.prisma.user.findFirst({ where: { id: userId } });
      if (!user) {
        throw new Error("User not found");
      }

      return { type: "voted", vote, user, streamId };
    } catch (e) {
      console.error(e);
      throw e; 
    }
  }


  async removeStream(streamId: string, userId: string) {
    try {
      const redis = await this.getRedisClient();
      const userExistsInRedis = await redis.exists(userId); 
      if (!userExistsInRedis) {
        throw new Error("User not found in redis");
      }

      const prisma = await this.getPrisma();
      const user = await prisma.user.findFirst({ where: { id: userId } });
      if (!user) {
        throw new Error("User not found");
      }

      return { type: "removestream", streamId, user };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}