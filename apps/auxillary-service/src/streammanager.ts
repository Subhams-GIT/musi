import WebSocket, { WebSocketServer } from "ws";
import { createClient, RedisClientType } from "redis";
import youtubesearchapi from "youtube-search-api";
import { Job, Queue, Worker } from "bullmq";
import  prisma  from "@repo/db";
import { checkforurl } from "./util.js";

const {PrismaClient}=prisma.PrismaClient;
const MAX_QUEUE_LENGTH = 5;
const connection = {
    host: "localhost",
    port: 6379
}
const redisCredentials = {
    url: 'redis://localhost:6379'
}

type User = {
    userId: string,
    ws: WebSocket[];
    token: string;
    isAdmin: boolean;
}

type Space = {
    creatorId: string;
    users: Map<String, User>
}

export default class SpaceManager {
    private static instance: SpaceManager;
    public spaces: Map<string, Space>;
    public users: Map<string, User>;
    public redisClient: RedisClientType;
    public publisher: RedisClientType;
    public consumer: RedisClientType;
    public prisma: typeof PrismaClient;
    public queue: Queue;
    public worker: Worker;
    public wstoSpace: Map<WebSocket, string>;


    private constructor() {
        this.spaces = new Map();
        this.users = new Map();
        this.redisClient = createClient(redisCredentials);
        this.publisher = createClient(redisCredentials);
        this.consumer = createClient(redisCredentials);
        this.prisma = new PrismaClient();
        this.queue = new Queue(process.pid.toString(), {
            connection,
        });
        this.worker = new Worker(process.pid.toString(), async (job: Job) => await this.processJob(job), {
            connection,
        });
        this.wstoSpace = new Map();
    }

    static getInstance() {
        if (!SpaceManager.instance) {
            return new SpaceManager;
        }
        return SpaceManager.instance;
    }

    async processJob(job: Job) {
        const { name, data } = job;

        switch (name) {
            case 'cast-vote':
                break;
            case 'add-stream':
                break;
            case 'remove-stream':
                break;
            case 'emptyQueue':
                break;
            case 'play-next':
                break;
            default:
                break;
        }
    }

    async initRedisClient() {
        await this.redisClient.connect();
        await this.publisher.connect();
        await this.consumer.connect();
    }

    onSubscribeRoom(message: string, spaceID: string) {
        const { type, data } = JSON.parse(message);
        if (type === 'new-stream') {
            
        } else if (type === 'new-vote') {

        } else if (type === 'play-next') {

        } else if (type === 'remove-song') {

        } else if (type === 'empty-queue') {

        }
    }

    async createRoom(spaceID: string, creatorId: string) {
        if (!this.spaces.has(spaceID)) {
            this.spaces.set(spaceID, {
                users: new Map<string, User>(),
                creatorId
            })
        }
        await this.consumer.subscribe(spaceID, (message) => this.onSubscribeRoom(message, spaceID));
    }

    async addUser(userId: string, ws: WebSocket, token: string) {
        let user = this.users.get(userId);
        if (!user) {
            this.users.set(userId, {
                userId,
                ws: [ws],
                token,
                isAdmin: false
            });
        } else {
            if (!user.ws.includes(ws)) {
                user.ws.push(ws);
            }
        }
    }
    async joinRoom(spaceID: string, creatorID: string, userID: string, ws: WebSocket, token: string) {
        let space = this.spaces.get(spaceID);
        let user = this.users.get(userID);

        if (!space) {
            return new Error('no space exists')
        }
        if (!user) {
            await this.addUser(userID, ws, token);
        } else {
            if (!user.ws.includes(ws)) {
                user.ws.push(ws)
            }
        }

        this.wstoSpace.set(ws, spaceID);
        if (space && user) {
            space.users.set(userID, user);
            this.spaces.set(spaceID, {
                ...space,
                users: new Map(space.users),
                creatorId: creatorID,
            });
        }
    }

    publishEmptyQueue(spaceID: string) {
        const space = this.spaces.get(spaceID);

        if (!space) {
            return new Error('space not found')
        }

        try {
            space.users.forEach(user => {
                user.ws.forEach(ws => {
                    ws.send(JSON.stringify({ type: `empty-queue/${spaceID}` }))
                })
            })
        } catch (err) {
            console.warn("Failed to send empty-queue to ws", err);
        }
    }

    async adminEmptyQueue(spaceId: string) {
        const room = this.spaces.get(spaceId);
        const userId = this.spaces.get(spaceId)?.creatorId;


        if (!room || !userId) return;

        // mark all as played
        await this.prisma.stream.updateMany({
            where: {
                played: false,
                spaceId: spaceId,
            },
            data: {
                played: true,
                playedTs: new Date(),
            },
        });

        await this.publisher.publish(
            spaceId,
            JSON.stringify({
                type: "empty-queue",
            })
        );
    }

    publishRemoveSong(spaceId: string, streamId: string) {
        const space = this.spaces.get(spaceId);
        space?.users.forEach((user) => {
            user.ws.forEach((ws) => {
                try {
                    ws.send(
                        JSON.stringify({
                            type: `remove-song/${spaceId}`,
                            data: { streamId, spaceId },
                        })
                    );
                } catch (err) {
                    console.warn("failed to send remove-song", err);
                }
            });
        });
    }

    async adminRemoveSong(spaceId: string, userId: string, streamId: string) {
        const user = this.users.get(userId);
        const creatorId = this.spaces.get(spaceId)?.creatorId;


        if (user && userId === creatorId) {
            // Delete by id (id should be unique). If you need to enforce spaceId as well,
            // consider a small safety check first instead of using where with two fields.
            const stream = await this.prisma.stream.findUnique({ where: { id: streamId } });
            if (!stream) return;
            if (stream.spaceId !== spaceId) return; // safety


            await this.prisma.stream.delete({ where: { id: streamId } });


            await this.publisher.publish(
                spaceId,
                JSON.stringify({
                    type: "remove-song",
                    data: { streamId, spaceId },
                })
            );
        } else {
            user?.ws.forEach((ws) => {
                ws.send(
                    JSON.stringify({
                        type: "error",
                        data: { message: "You can't remove the song. You are not the host" },
                    })
                );
            });
        }
    }

    publishNewVote(spaceId: string, streamId: string, vote: "upvote" | "downvote", votedBy: string) {
        const spaces = this.spaces.get(spaceId);
        spaces?.users.forEach((user) => {
            user.ws.forEach((ws) => {
                try {
                    ws.send(JSON.stringify({ type: `new-vote/${spaceId}`, data: { vote, streamId, votedBy, spaceId } }));
                } catch (err) {
                    console.warn("failed to send new-vote", err);
                }
            });
        });
    }


    async PlayNext(spaceId: string, userId: string) {
        const creatorId = this.spaces.get(spaceId)?.creatorId;
        let targetUser = this.users.get(userId);
        if (!targetUser) return;


        if (targetUser.userId !== creatorId) {
            targetUser.ws.forEach((ws) =>
                ws.send(JSON.stringify({ type: "error", data: { message: "You can't perform this action." } }))
            );
            return;
        }


        const mostUpvotedStream = await this.prisma.stream.findFirst({
            where: { played: false, spaceId },
            orderBy: { upvotes: { _count: "desc" } },
        });


        if (!mostUpvotedStream) {
            targetUser.ws.forEach((ws) =>
                ws.send(JSON.stringify({ type: "error", data: { message: "Please add video in queue" } }))
            );
            return;
        }


        await Promise.all([
            this.prisma.currentStream.upsert({
                where: { spaceId },
                update: { spaceId, userId, streamId: mostUpvotedStream.id },
                create: { spaceId, userId, streamId: mostUpvotedStream.id },
            }),
            this.prisma.stream.update({ where: { id: mostUpvotedStream.id }, data: { played: true, playedTs: new Date() } }),
        ]);


        // decrement queue-length safely
        const prev = await this.redisClient.get(`queue-length-${spaceId}`);
        const previousQueueLength = prev ? parseInt(prev, 10) : 1;
        if (!isNaN(previousQueueLength) && previousQueueLength > 0) {
            await this.redisClient.set(`queue-length-${spaceId}`, String(previousQueueLength - 1));
        }

        await this.publisher.publish(spaceId, JSON.stringify({ type: "play-next" }));
    }

    async adminCastVote(userID: string, userId: string, streamId: string, vote: string, spaceId: string) {
        try {
            const creatorID = this.spaces.get(spaceId)?.creatorId;
            if (userID !== creatorID) {
                return new Error('you are not the creator!')
            }

            if (vote === "upvote") {
                await this.prisma.upvote.create({ data: { id: crypto.randomUUID(), userId, streamId } });
            } else {
                await this.prisma.upvote.delete({ where: { userId_streamId: { userId, streamId } } });
            }

            await this.redisClient.set(`lastVoted-${spaceId}-${userId}`, String(Date.now()));
            await this.publisher.publish(spaceId, JSON.stringify({ type: "new-vote", data: { streamId, vote, votedBy: userId } }));
        } catch (err) {
            console.error("adminCastVote error", err);
        }
    }

    async castVote(userID: string, streamID: string, vote: "up" | "down", spaceID: string) {
        let space = this.spaces.get(spaceID);
        let currentuser = this.users.get(userID);
        let creatorID = this.spaces.get(spaceID)?.creatorId;
        let isCreator = currentuser?.userId === creatorID;

        if (!space) {
            return new Error('space not valid ')
        }
        if (!currentuser) {
            return new Error('not present in the stream')
        }
        if (!isCreator) {
            const lastVoted = await this.redisClient.get(`lastVoted-${spaceID}-${userID}`);
            if (lastVoted) {
                currentuser.ws.forEach((ws) =>
                    ws.send(JSON.stringify({ type: "error", data: { message: "You can vote after 20 mins" } }))
                );
                return;
            }
        }
        await this.queue.add("cast-vote", { creatorID, userID, streamID, vote, spaceID });
    }

    publishNewStream(spaceId: string, data: any) {
        const space = this.spaces.get(spaceId);
        if (space) {
            space.users.forEach((user) => {
                user.ws.forEach((ws) => {
                    try {
                        ws.send(JSON.stringify({ type: `new-stream/${spaceId}`, data }));
                    } catch (err) {
                        console.warn("failed new-stream send", err);
                    }
                });
            });
        }
    }
    async addStream(spaceID: string, userID: string, url: string, currentStreamlength: number) {
        const room = this.spaces.get(spaceID);
        const currentUser = this.users.get(userID);


        if (!room || typeof currentStreamlength !== "number") return;


        const extractedId = url.split("?v=")[1];
        if (!extractedId) {
            currentUser?.ws.forEach((ws) => ws.send(JSON.stringify({ type: "error", data: { message: "Invalid YouTube URL" } })));
            return;
        }


        await this.redisClient.set(`queue-length-${spaceID}`, String(currentStreamlength + 1));


        const res = await youtubesearchapi.GetVideoDetails(extractedId);
        if (!res || !res.thumbnail) {
            currentUser?.ws.forEach((ws) => ws.send(JSON.stringify({ type: "error", data: { message: "Video not found" } })));
            return;
        }


        const thumbnails = res.thumbnail.thumbnails || [];
        thumbnails.sort((a: any, b: any) => (a.width < b.width ? -1 : 1));


        const stream = await this.prisma.stream.create({
            data: {
                id: crypto.randomUUID(),
                userId: userID,
                url: url,
                extractedId,
                type: "Youtube",
                addedBy: userID,
                title: res.title ?? "Cant find video",
                smallImg: thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1]?.url ?? "",
                bigImg: thumbnails[thumbnails.length - 1]?.url ?? "",
                spaceId: spaceID,
            },
        });


        await this.redisClient.set(`${spaceID}-${url}`, String(Date.now()));
        await this.redisClient.set(`lastAdded-${spaceID}-${userID}`, String(Date.now()));


        await this.publisher.publish(spaceID, JSON.stringify({ type: "new-stream", data: { ...stream, hasUpvoted: false, upvotes: 0 } }));
    }


    async addToQueue(spaceId: string, currentUserId: string, url: string) {
        const space = this.spaces.get(spaceId);
        const currentUser = this.users.get(currentUserId);
        const creatorId = this.spaces.get(spaceId)?.creatorId;
        const isCreator = currentUserId === creatorId;


        if (!space || !currentUser) {
            console.log("Room or User not defined");
            return;
        }


        if (!checkforurl(url)) {
            currentUser?.ws.forEach((ws) => ws.send(JSON.stringify({ type: "error", data: { message: "Invalid YouTube URL" } })));
            return;
        }

        let previousQueueLengthStr = await this.redisClient.get(`queue-length-${spaceId}`);
        let previousQueueLength = previousQueueLengthStr ? parseInt(previousQueueLengthStr, 10) : 0;


        if (!previousQueueLength) {
            previousQueueLength = await this.prisma.stream.count({ where: { spaceId, played: false } });
        }


        if (!isCreator) {
            const lastAdded = await this.redisClient.get(`lastAdded-${spaceId}-${currentUserId}`);
            if (lastAdded) {
                currentUser.ws.forEach((ws) => ws.send(JSON.stringify({ type: "error", data: { message: "You can add again after 20 min." } })));
                return;
            }


            const alreadyAdded = await this.redisClient.get(`${spaceId}-${url}`);
            if (alreadyAdded) {
                currentUser.ws.forEach((ws) => ws.send(JSON.stringify({ type: "error", data: { message: "This song is blocked for 1 hour" } })));
                return;
            }


            if (previousQueueLength >= MAX_QUEUE_LENGTH) {
                currentUser.ws.forEach((ws) => ws.send(JSON.stringify({ type: "error", data: { message: "Queue limit reached" } })));
                return;
            }
        }


        await this.queue.add("add-to-queue", { spaceId, userId: currentUser.userId, url, existingActiveStream: previousQueueLength });
    }

    disconnect(ws: WebSocket) {
        console.log(process.pid + ": disconnect");
        let userId: string | null = null;
        const spaceId = this.wstoSpace.get(ws);


        this.users.forEach((user, id) => {
            const wsIndex = user.ws.indexOf(ws);
            if (wsIndex !== -1) {
                userId = id;
                user.ws.splice(wsIndex, 1);
            }
            if (user.ws.length === 0) {
                this.users.delete(id);
            }
        });


        if (userId && spaceId) {
            const space = this.spaces.get(spaceId);
            if (space) {
                const updatedUsers = new Map(Array.from(space.users).filter(([usrId]) => userId !== usrId));
                this.spaces.set(spaceId, { ...space, users: updatedUsers });
            }
        }


        this.wstoSpace.delete(ws);
    }
}