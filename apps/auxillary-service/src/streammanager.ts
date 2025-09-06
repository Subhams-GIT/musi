import { Queue, Worker, Job } from "bullmq";
import { getRedisClient } from '@repo/redis';
import {  PrismaClient } from "@repo/db";
import type { RedisClientType } from "redis";
import { wss } from "./index";
import { prisma } from "@repo/db";
import { checkforurl } from "./util";
type User = {
	userId: string;
	ws: WebSocket[];
	token: string;
};

const connection = {
	username: process.env.REDIS_USERNAME || "",
	password: process.env.REDIS_PASSWORD || "",
	host: process.env.REDIS_HOST || "",
	port: parseInt(process.env.REDIS_PORT || "") || 6379,
}


class streamManager {
	/*
	bull mq  initialise karna padega 
	push to the queue once someone votes 
	then the server pulls from the queue and then processes it 
	notifies if it suceeds and then publishes to the ws server 
	the ws server sents the event description to connected clients 
	clients receive it and then updates the queue  	

	vote -> userid,streamid , 
	*/
	private static instance: streamManager;
	public users: Map<string, User>;
	public producer: RedisClientType;
	public consumer: RedisClientType;
	public prisma: PrismaClient;
	public redisClient: RedisClientType;
	public queue: Queue;
	public worker: Worker;

	private constructor() {
		this.users = new Map();
		this.redisClient = getRedisClient;
		this.producer = getRedisClient;
		this.consumer = getRedisClient;
		this.prisma = prisma;
		this.queue = new Queue(process.pid.toString(), {
			connection,
		});
		this.worker = new Worker(process.pid.toString(), this.processJob, {
			connection,
		});

	}

	static getInstance() {
		if (!streamManager.instance) {
			streamManager.instance = new streamManager();
		}

		return streamManager.instance;
	}

	async initRedisClient() {
		await this.redisClient.connect();
		await this.producer.connect();
		await this.consumer.connect();
	}

	async processJob(JOB: Job) {
		const { data, name } = JOB;

		switch (name) {
			case 'vote':
				break;
			case 'addStream':
				// this.addStream(data)
				break;
			case 'removeStream':
				// this.removestream()
				break;
			case 'playnext':
				break;
			case 'empty-queue':
				break;
			default:
				break;
		}
	}

	
	async joinRoom(roomid: string, userId: string, ws: WebSocket, token: string) {
		let user = this.users.get(userId);
		if (!user) {
			user = { userId, ws: [ws], token };
			this.users.set(userId, user);
		} else {
			user.ws.push(ws);
		}
		const userdetails=await prisma.user.findfirst({
			where:{
				id:userId
			}
		})
		wss.clients.forEach(client => {
			client.send(JSON.stringify({ type: "joined stream", roomId: roomid, userdetails.name }));
		});
	}

	createRoom(hashid: string, userId: string, ws: WebSocket, token: string) {
		if (this.users.has(userId)) {
			throw new Error("User already in a room");
		}
		this.users.set(userId, { userId, ws: [ws], token });
		wss.clients.forEach(client => {
			client.send(JSON.stringify({ type: "room created", roomId: hashid, userId }));
		});
	}

	addStream(streamurl: string, userId: string) {
		if (!this.users.get(userId)) {
			throw new Error("User not in a room");
		}
		if (!checkforurl(streamurl)) {
			throw new Error("Stream URL not correct!");
		}
		this.queue.add('addStream', { streamurl, userId });
		wss.clients.forEach(client => {
			client.send(JSON.stringify({ type: "song added in stream", streamUrl: streamurl, userId }));
		});
	}

	vote(streamId: string, vote: 'up' | 'down', userId: string) {
		if (!this.users.get(userId)) {
			throw new Error("User not in a room");
		}
		this.queue.add('vote', { streamId, vote, userId });
		wss.clients.forEach(client => {
			client.send(JSON.stringify({ type: "vote", streamId, vote, userId }));
		});
	}

	removestream(streamId: string, userId: string) {
		if (!this.users.get(userId)) {
			throw new Error("User not in a room");
		}
		this.queue.add('removeStream', { streamId, userId });
		wss.clients.forEach(client => {
			client.send(JSON.stringify({ type: "stream removed", streamId, userId }));
		});
	}

	playnext(userId: string) {
		if (!this.users.get(userId)) {
			throw new Error("User not in a room");
		}
		this.queue.add('playnext', { userId });
		wss.clients.forEach(client => {
			client.send(JSON.stringify({ type: "play next", userId }));
		});
	}

	emptyQueue(userId: string) {
		if (!this.users.get(userId)) {
			throw new Error("User not in a room");
		}
		this.queue.add('empty-queue', { userId });
		wss.clients.forEach(client => {
			client.send(JSON.stringify({ type: "queue emptied", userId }));
		});
	}

}