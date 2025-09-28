import { Queue, Worker, Job } from "bullmq";
import { createClient, type RedisClientType } from "redis";
import type { PrismaClient } from "@repo/db";
import type { WebSocket } from "ws";
import { checkforurl } from "./util.js";
import youtubesearchapi from 'youtube-search-api';
import axios from "axios";
import { wss } from "./index.js";


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


  async processJob(job: Job) {
    const { data, name } = job;
    switch (name) {
      case "createRoom":
        await this.createRoom(data.roomname, data.description, data.userId);
        break;
      case "joinRoom":
        await this.joinRoom(data.roomId);
        break;
        // case "vote":
        //   await this.vote(data.streamId, data.vote, data.userId);
        //   break;
        // case "addStream":
        //   await this.addStream(data.streamUrl, data.userId, data.roomId);
        //   break;
        // case "removeStream":
        //   await this.removeStream(data.streamId, data.userId);
        break;
    }
  }

  async createRoom(roomname: string, description: string, userID: string) {
    if (!roomname || !description || !userID) {
      return new Error('pls provide all details')
    }
    try {
      await axios.post('http://localhost:3000/api/spaces', {
        spaceName: roomname,
        description
      })

    } catch (error) {
      console.error(error)
      return new Error('cannot create space');
    }
  }

  async joinRoom(id: string) {
  if (!id) {
    return new Error("Please provide all details");
  }

  try {
    const res = await axios.post(`http://localhost:3000/api/spaces/join?id=${id}`,);
    wss.clients.forEach(client => {
      client.send(JSON.stringify({
        type: "user joined",
        joinee: res.data.joinee,  
      }));
    });
  } catch (err) {
    console.error("Error joining room:", err);
  }
  }

}