import { Queue, Worker, Job } from "bullmq";
import { getRedisClient } from '@repo/redis';
import { PrismaClient } from "@repo/db";
import type { RedisClientType } from "redis";
import type { WebSocket } from "ws";
import { wss } from "./index";
import { prisma as prismaInstance } from "@repo/db";
import { checkforurl } from "./util";
type User = {
	userId: string;
	admin: boolean;
	ws: WebSocket[];
	token: string;
};

const connection = {
	username: process.env.REDIS_USERNAME || "",
	password: process.env.REDIS_PASSWORD || "",
	host: process.env.REDIS_HOST || "",
	port: parseInt(process.env.REDIS_PORT || "") || 6379,
}


export class streamManager {
	/*
	bull mq  initialise karna padega 
	push to the queue once someone votes 
	then the server pulls from the queue and then processes it 
	notifies if it suceeds and then publishes to the ws server 
	the ws server sents the event description to connected clients 
	clients receive it and then updates the queue  	
	vote -> userid,streamid ,choice  
	*/
	private static instance: streamManager;
	public users: Map<string, User>;
	public prisma: PrismaClient;
	public redisClient?: RedisClientType;
	public queue: Queue;
	public worker: Worker;

	private constructor() {
		this.users = new Map();
		this.prisma = prismaInstance;
		this.queue = new Queue('stream-queue', {
			connection,
		});
		this.worker = new Worker('stream-queue', async (job: Job) => this.processJob(job), {
			connection,
		});

		this.worker.on('completed', (job: Job) => {
			console.log(`Job ${job.id} completed: ${job.name}`);
		});

		this.worker.on('failed', (job: Job | undefined, err: Error) => {
			console.error(`Job ${job?.id} failed: ${job?.name}`, err);
		});
	}

	static getInstance() {
		if (!streamManager.instance) {
			streamManager.instance = new streamManager();
		}

		return streamManager.instance;
	}

	async initRedisClient() {
		this.redisClient = await getRedisClient();
	}

	async processJob(JOB: Job) {
		const { data, name } = JOB;

		switch (name) {
			case 'createRoom':
				await this.createRoom(data.roomId, data.userId, data.ws, data.token)
				break;
			case 'joinRoom':
				await this.joinRoom(data.roomId, data.userId, data.ws, data.token)
				break;
			case 'vote':
				await this.vote(data.streamId, data.vote, data.userId)
				break;
			case 'addStream':
				await this.addStream(data.streamUrl, data.userId, data.streamerId)
				break;
			case 'removeStream':
				await this.removestream(data.streamUrl, data.userId)
				break;
			default:
				break;
		}
	}

	async joinRoom(roomId: string, userId: string, ws: WebSocket, token: string) {

	// 	if (!this.redisClient) await this.initRedisClient();

	// 	const exists = await this.redisClient?.exists(roomId)
	// 	if (!exists) {
	// 		throw new Error("Room not found");
	// 	}

	// 	let user = this.users.get(userId);
	// 	if (!user) {
	// 		user = { userId, ws: [ws], token, admin: false };
	// 		this.users.set(userId, user);
	// 	} else {
	// 		user.ws.push(ws);
	// 	}

	// 	await this.redisClient.sAdd({roomId:participants}, userId);

	// 	const userdetails = await this.prisma.user.findFirst({
	// 		where: { id: userId }
	// 	});

	// 	if(!userdetails){
	// 		throw new Error("User not found");
	// 	}
		
	// 	wss.clients.forEach(client => {
	// 		client.send(JSON.stringify({ type: "joined stream", roomId, userdetails }));
	// 	});
	}

	async createRoom(hashid: string, userId: string, ws: WebSocket, token: string) {
		if (this.users.has(userId)) {
			throw new Error("User already in a room");
		}
		this.users.set(userId, { userId, ws: [ws], token, admin: true });
		try {
			await this.redisClient?.hSet(hashid, {
				admin: userId,
				createdAt: Date.now().toString(),
				isLive: true.toString()
			})

		} catch (error) {
			console.error(error)
		}
	}

	async addStream(streamurl: string, userId: string, streamerId: string) {
		if (!this.users.get(userId)) {
			throw new Error("User not in a room");
		}
		else if (!checkforurl(streamurl)) {
			throw new Error("Stream URL not correct!");
		}
		try {
			await fetch('http://localhost:3000/api/streams', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}, body: JSON.stringify({
					creatorId: streamerId,
					url: streamurl,
					type: streamurl.includes("youtube.com") ? "Youtube" : "Spotify"
				})
			})
			wss.clients.forEach(client => {
				client.send(JSON.stringify({ type: "song added in stream", streamUrl: streamurl, userId }));
			});
		} catch (error) {
			console.error(error)
		}
	}

	async vote(streamId: string, vote: 'up' | 'down', userId: string) {
		if (!this.users.get(userId)) {
			throw new Error("User not in a room");
		}
		if (vote === 'up') {
			fetch('http://localhost:3000/api/streams/upvote', {
				method: 'POST',
				headers: {
					'Content-type': 'application/json'
				},
				body: JSON.stringify({ streamId })
			}).then(res => {
				if (res.status === 200) {
					wss.clients.forEach(client => {
						client.send(JSON.stringify({ type: "vote", streamId, vote, userId }));
					});
				} else {
					throw new Error("Failed to upvote");
				}
			}).catch(err => {
				throw new Error("Failed to upvote");
			})
		} else {
			fetch('http://localhost:3000/api/streams/downvote', {
				method: 'POST',
				headers: {
					'Content-type': 'application/json'
				},
				body: JSON.stringify({ streamId })
			}).then(res => {
				if (res.status === 200) {
					wss.clients.forEach(client => {
						client.send(JSON.stringify({ type: "vote", streamId, vote, userId }));
					});
				}
			}).catch(err => {
				throw new Error("Failed to downvote");
			})
		}
	}

	async removestream(streamId: string, userId: string) {
		if (!this.users.get(userId)) {
			throw new Error("User not in a room");
		}
		if (!this.users.get(userId)?.admin) {
			throw new Error('you are not admin');
		}
		wss.clients.forEach(client => {
			client.send(JSON.stringify({ type: "stream removed", streamId, userId }));
		});
	}
}