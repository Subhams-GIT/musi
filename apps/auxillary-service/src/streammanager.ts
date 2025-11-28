import WebSocket from "ws";
import { createClient, RedisClientType } from "redis";
import {GetVideoDetails} from "youtube-search-api";
import { Job, Queue, Worker } from "bullmq";
import { checkforurl } from "./util.js";
import prisma from "@repo/db";
import { user } from "./types.js";


const MAX_QUEUE_LENGTH = 20;
const connection = {
  host: "localhost",
  port: 6379,
};
const redisCredentials = {
  url: "redis://localhost:6379",
};

type User = {
  userId: string;
  ws: WebSocket;
  token: string;
};

type Space = {
  creatorId: string;
  users: Map<String, User>;
};

export default class SpaceManager {
  private static instance: SpaceManager;
  public spaces: Map<string, Space>;
  public users: Map<string, User>;
  public redisClient: RedisClientType;
  public publisher: RedisClientType;
  public consumer: RedisClientType;
  public prisma: typeof prisma;
  public queue: Queue;
  public worker: Worker;
  public wstoSpace: Map<WebSocket, string>;

  private constructor() {
    this.spaces = new Map();
    this.users = new Map();
    this.redisClient = createClient(redisCredentials);
    this.publisher = createClient(redisCredentials);
    this.consumer = createClient(redisCredentials);
    this.prisma = prisma;
    this.queue = new Queue(process.pid.toString(), {
      connection,
    });
    this.worker = new Worker(
      process.pid.toString(),
      async (job: Job) => this.processJob(job),
      {
        connection,
      },
    );
    this.wstoSpace = new Map();
  }

  static getInstance() {
    if (!SpaceManager.instance) {
      SpaceManager.instance = new SpaceManager();
    }
    return SpaceManager.instance;
  }

  async processJob(job: Job) {
    const { name, data } = job;

    switch (name) {
      case "cast-vote":
        await this.CastVote(
          data.creatorID,
          data.userID,
          data.streamId,
          data.vote,
          data.spaceId,
        );
        break;
      case "add-stream":
        await this.addStream(
          data.spaceId,
          data.userId,
          data.url,
          data.currentStreamlength,
        );
        break;
      case "empty-queue":
        await this.adminEmptyQueue(data.spaceId);
        break;
      case "play-next":
        await this.PlayNext(data.spaceId, data.userId);
        break;
      case 'play-song':

      default:
        break;
    }
  }

  async initRedisClient() {
    await this.redisClient.connect();
    await this.publisher.connect();
    await this.consumer.connect();
    this.consumer.on("error", (err) => console.error("Redis consumer error:", err));
    
      await this.consumer.pSubscribe("*", (message, channel) => {
        this.onSubscribeRoom(message, channel);
      });
    }

  onSubscribeRoom(message: string, spaceID: string) {
    try {
      const { type, data } = JSON.parse(message);
      if (type === "new-stream") {
        this.publishNewStream(spaceID, data);
      } else if (type === "new-vote") {
        this.publishNewVote(spaceID, data?.streamId, data?.vote, data?.votedBy);
      } else if (type === "play-next") {
        this.publishPlayNext(data.spaceId);
      } else if (type === "remove-song") {
        this.publishRemoveSong(spaceID, data?.streamId);
      } else if (type === "empty-queue") {
        this.publishEmptyQueue(spaceID);
      }
    } catch (err) {
      console.warn("on Subscribe Room parse/forward error", err);
    }
  }

  async createRoom(spaceID: string) {
    this.spaces.set(spaceID, {
      creatorId: "",
      users: new Map<string, User>(),
    });
  }

  async controlSong(spaceId:string,isplaying:boolean,streamId:string,userId:string){
    const user=this.users.get(userId);
    if(!user || user.userId!==this.spaces.get(spaceId)?.creatorId){
      return new Error('Error');
    }

    const space=this.spaces.get(spaceId);
    if(!space){
      return new Error('space not found');
    }
    try {
      console.log({spaceId,isplaying,streamId})
      const message=isplaying?JSON.stringify({type:"play-song",spaceId}):JSON.stringify({type:"pause-song",spaceId})
      space.users.forEach(user=>{
        user.ws.send(message);
      })

      await this.prisma.stream.update({
         where:{id:streamId},
         data:{
           active: isplaying,
          played:isplaying 
         }
      })

    } catch (error) {
      console.error("control song error",error);
    }
  }

  async joinRoom(
    spaceID: string,
    creatorID: string,
    userID: string,
    ws: WebSocket,
    token: string) {
    
    let space = this.spaces.get(spaceID);
    let user = this.users.get(userID);
    if (!space) {
      await this.createRoom(spaceID);
      space = this.spaces.get(spaceID);
    }
    if(user?.userId!==space?.creatorId){
      ws.send(JSON.stringify({type:'error',data:{message:'Authentication Error'}}))
    }
    if (!user) {
      this.users.set(userID, {
        userId: userID,
        ws: ws,
        token,
      });
      user = this.users.get(userID);
    } else {
      if (user.ws=== ws) {
        user.ws=ws;
      }
    }

    this.wstoSpace.set(ws, spaceID);

    if (user && space) {
      space.users.set(userID, user);
      this.spaces.set(spaceID, {
        ...space,
        users: new Map(space.users),
        creatorId: creatorID,
      });
    }

    const joineduser: user | null = await this.prisma.user.findFirst({
      where: {
        id: userID,
      },
    });

    if (!joineduser) {
      return new Error("could not find user");
    }

    const name = joineduser.name;
    const usernames={
      userIDs:Array.from(this.spaces.get(spaceID)?.users.keys() || []),
      name:name
    }

    space?.users.forEach((user)=>{
      user.ws.send(JSON.stringify({type:'joined-space',data:{usernames,spaceID}}))
    })
    
  }

  publishEmptyQueue(spaceID: string) {
    const space = this.spaces.get(spaceID);

    if (!space) {
      return new Error("space not found");
    }

    try {
      space.users.forEach((user) => {
        user.ws.send(JSON.stringify({ type: `empty-queue/${spaceID}` }));
        }
      );
    } catch (err) {
      console.warn("Failed to send empty-queue to ws", err);
    }
  }

  async adminEmptyQueue(spaceId: string) {
    const room = this.spaces.get(spaceId);
    const userId = this.spaces.get(spaceId)?.creatorId;

    if (!room || !userId) return;


    await this.prisma.stream.updateMany({
      where: {
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
      }),
    );
  }

  publishRemoveSong(spaceId: string, streamId: string) {
    const space = this.spaces.get(spaceId);
    space?.users.forEach((user) => {
      try{
        user.ws.send(JSON.stringify({
          type: `remove-song/${spaceId}`,
          data: { streamId, spaceId },
        }))
      }
      catch(e){
        console.error(e)
      }
    })
  }

  async adminRemoveSong(spaceId: string, userId: string, streamId: string) {
    const user = this.users.get(userId);
    const creatorId = this.spaces.get(spaceId)?.creatorId;

    if (user && userId === creatorId) {
      const stream = await this.prisma.stream.findUnique({
        where: { id: streamId },
      });
      if (!stream) return;
      if (stream.spaceId !== spaceId) return; // safety

      await this.prisma.stream.delete({ where: { id: streamId } });

      await this.publisher.publish(
        spaceId,
        JSON.stringify({
          type: "remove-song",
          data: { streamId, spaceId },
        }),
      );
    } else {
      user?.ws.send(
          JSON.stringify({
            type: "error",
            data: {
              message: "You can't remove the song. You are not the host",
            },
          }),
        );
      }
    }

  publishNewVote(
    spaceId: string,
    streamId: string,
    vote: "up" | "down",
    votedBy: string,
  ) {
    const spaces = this.spaces.get(spaceId);
    console.log('publishing vote ')
    try{
      spaces?.users.forEach((user)=>{
        console.log('sending new-vote to user',user.userId);
        user.ws.send(JSON.stringify({type:`new-vote/${spaceId}`,data:{vote,streamId,votedBy,spaceId}}))
      })
    }catch(err){
      console.warn("failed to send new-vote",err);
    }
  }

  publishPlayNext(spaceId: string) {
    const space = this.spaces.get(spaceId);
    space?.users.forEach((user, userId) => {
      user?.ws.send(
          JSON.stringify({
            type: `play-next/${spaceId}`, 
          }),
        );
      });
    }

  async PlayNext(spaceId: string, userId: string) {
    const creatorId = this.spaces.get(spaceId)?.creatorId;
    let targetUser = this.users.get(userId);
    if (!targetUser) return;

    if (targetUser.userId !== creatorId) {
      targetUser.ws.send(
          JSON.stringify({
            type: "error",
            data: { message: "You can't perform this action." },
          }),
        )
      return;
    }

    const mostUpvotedStream = await this.prisma.stream.findFirst({
      where: { played: false, spaceId },
      orderBy: {
        upvotes: "desc",
      },
    });

    if (!mostUpvotedStream) {
      targetUser.ws.send(
          JSON.stringify({
            type: "error",
            data: { message: "Please add video in queue" },
          }),
        )
      return;
    }

    await Promise.all([
      this.prisma.currentStream.upsert({
        where: { spaceId },
        update: { spaceId, userId, streamId: mostUpvotedStream.id },
        create: { spaceId, userId, streamId: mostUpvotedStream.id },
      }),
      this.prisma.stream.update({
        where: { id: mostUpvotedStream.id },
        data: { played: true, playedTs: new Date() },
      }),
    ]);

    const prev = await this.redisClient.get(`queue-length-${spaceId}`);
    const previousQueueLength = prev ? parseInt(prev, 10) : 1;
    if (!isNaN(previousQueueLength) && previousQueueLength > 0) {
      await this.redisClient.set(
        `queue-length-${spaceId}`,
        String(previousQueueLength - 1),
      );
    }

    await this.publisher.publish(
      spaceId,
      JSON.stringify({ type: "play-next" }),
    );
  }

  async CastVote(
    creatorID: string,
    userID: string,
    streamId: string,
    vote: string,
    spaceId: string,
  ) {
    console.log({creatorID,userID,streamId,vote,spaceId})
    try {
      const user =await this.prisma.user.findFirst({
        where:{id:userID},
        select:{
          name:true
        }
      })
      if (vote === "up") {
        await this.prisma.stream.update({
          where:{id:streamId},
          data:{
            upvotes:{
              increment:1
            }
          }
        }
        )
      } else {
        await this.prisma.stream.update({
          where:{id:streamId},
          data:{
            upvotes:{
              decrement:1
            }
          }
        })
      }
      
      await this.redisClient.set(
        `lastVoted-${spaceId}-${userID}`,
        String(Date.now()),
      );
      
      await this.publisher.publish(
        spaceId,
        JSON.stringify({
          type: "new-vote",
          data: { streamId, vote, votedBy: user?.name },
        }),
      );
    } catch (err) {
      console.error("CastVote error", err);
    }
  }

  async castVote(
    userID: string,
    streamID: string,
    vote: "up" | "down",
    spaceID: string,) {
    let space = this.spaces.get(spaceID);
    let currentuser = this.users.get(userID);
    let creatorID = this.spaces.get(spaceID)?.creatorId;
    let isCreator = currentuser?.userId === creatorID;

    if (!space) {
      return new Error("space not valid ");
    }
    if (!currentuser) {
      return new Error("not present in the stream");
    }
    if (!isCreator) {
      const lastVoted = await this.redisClient.get(`lastVoted-${spaceID}-${userID}`);
      
      {
        this.queue.add('cast-vote',{
          creatorID,
          userID,
          streamId:streamID,
          vote,
          spaceId:spaceID
        })
      }
      return ;
    }
    await this.queue.add("cast-vote", {
      creatorID,
      userID,
      streamId:streamID,
      vote,
      spaceId:spaceID
    });
  }

  publishNewStream(spaceId: string, data: any) {
    const space = this.spaces.get(spaceId);
    console.log("space reached!")
    if (space) {
      try{
        space.users.forEach(user=>{
          user.ws.send(JSON.stringify({type:`new-stream/${spaceId}`,data}))
        })
      }catch(err){
       console.warn(err); 
      }
    }
  }
  
  async addStream(
    spaceID: string,
    userID: string,
    url: string,
    currentStreamlength: number) {
    const room = this.spaces.get(spaceID);
    const currentUser = this.users.get(userID);
    console.log('reached')
    if (!room || typeof currentStreamlength !== "number") return;

    const extractedId = url.split("?v=")[1];
    if (!extractedId) {
      currentUser?.ws.send(
          JSON.stringify({
            type: "error",
            data: { message: "Invalid YouTube URL" },
          }),
        )
      return;
    }
    try{
    console.log({spaceID,userID,url,currentStreamlength})
    await this.redisClient.set(
      `queue-length-${spaceID}`,
      String(currentStreamlength + 1),
    );
    const res = await GetVideoDetails(extractedId);
    console.log({res});
    if (!res || !res.thumbnail) {
      currentUser?.ws.send(
          JSON.stringify({
            type: "error",
            data: { message: "Video not found" },
          }),
        )
      return;
    }

    const thumbnails = res.thumbnail.thumbnails || [];
    thumbnails.sort((a: any, b: any) => (a.width < b.width ? -1 : 1));
    console.log('stream pre-creation')
    
    const stream = await this.prisma.stream.create({
      data: {
        id: crypto.randomUUID(),
        userId: userID,
        url: url,
        extractedId,
        type: "Youtube",
        addedBy: userID,
        title: res.title ?? "Cant find video",
        smallThumbnail:
          thumbnails.length > 1
            ? thumbnails[thumbnails.length - 2].url
            : (thumbnails[thumbnails.length - 1]?.url ?? ""),
        largeThumbnail: thumbnails[thumbnails.length - 1]?.url ?? "",
        spaceId: spaceID,
        active: true,
        upvotes: 0,
      },
    });

    await this.redisClient.set(`${spaceID}-${url}`, String(Date.now()));
    await this.redisClient.set(
      `lastAdded-${spaceID}-${userID}`,
      String(Date.now()),
      {EX:1200}
    );

    await this.publisher.publish(
      spaceID,
      JSON.stringify({
        type: "new-stream",
        data: { ...stream, hasUpvoted: false, upvotes: 0 },
      }),
    );
    }catch(e){
      console.error(e)
    }
  }

  async addToQueue(spaceId: string, currentUserId: string, url: string) {
    console.log(this.queue.count)
    const space = this.spaces.get(spaceId);
    const currentUser = this.users.get(currentUserId);
    const creatorId = this.spaces.get(spaceId)?.creatorId;
    const isCreator = currentUserId === creatorId;

    if (!space || !currentUser) {
      console.log("Room or User not defined");
      return;
    }

    if (!checkforurl(url)) {
      currentUser?.ws.send(
          JSON.stringify({
            type: "error",
            data: { message: "Invalid YouTube URL" },
          }),
        )
      return;
    }

    let previousQueueLengthStr = await this.redisClient.get(
      `queue-length-${spaceId}`,
    );
    let previousQueueLength = previousQueueLengthStr
      ? parseInt(previousQueueLengthStr, 10)
      : 0;

    if (!previousQueueLength) {
      previousQueueLength = await this.prisma.stream.count({
        where: { spaceId: spaceId, played: false },
      });
    }

    if (!isCreator) {
      const lastAdded = await this.redisClient.get(
        `lastAdded-${spaceId}-${currentUserId}`,
      );
      

      const alreadyAdded = await this.redisClient.get(`${spaceId}-${url}`);
      if (alreadyAdded) {
        currentUser.ws.send(
            JSON.stringify({
              type: "error",
              data: { message: "This song is blocked for 1 hour" },
            }),
          )
        return;
      }

      if (previousQueueLength >= MAX_QUEUE_LENGTH) {
        currentUser.ws.send(
            JSON.stringify({
              type: "error",
              data: { message: "Queue limit reached" },
            }),
          )
        return;
      }
    }
    console.log({currentUserId,spaceId,isCreator});
    await this.queue.add("add-stream", {
      spaceId,
      userId: currentUser.userId,
      url,
      currentStreamlength: previousQueueLength,
    });
  }
  
  publishDeactivation(spaceId:string){
    this.spaces.get(spaceId)?.users.forEach(user=>{
      user.ws.send(JSON.stringify({type:`space-deactivated/${spaceId}`}))
    })
  }
  async disconnect(ws: WebSocket) {
    console.log(process.pid + ": disconnect");
    let userId: string | null = null;
    const spaceId = this.wstoSpace.get(ws);
    if(!spaceId){
      return new Error('spaceId not found');
    }
    const creatorId=this.spaces.get(spaceId??"")?.creatorId;
    this.users.forEach(async (user, id) => {
      if(user.ws==ws){
        this.users.delete(user.userId);
        userId = id; 
      }
    });

    if (userId && spaceId) {
      const space = this.spaces.get(spaceId);
      if (space) {
        const updatedUsers = new Map(
          Array.from(space.users).filter(([usrId]) => userId !== usrId),
        );
        this.spaces.set(spaceId, { ...space, users: updatedUsers });
      } // delete from space 
    }

    this.wstoSpace.delete(ws); // delete the user ws 
  }
  
  async dismissSpace(spaceId:string,userId:string){
    const space=this.spaces.get(spaceId);
    if(!space){
      return new Error('space not found');
    }
    if(space.creatorId!==userId){
      return new Error('only creator can dismiss the space');
    }
    this.prisma.space.update
    ({
      where:{id:spaceId},
      data:{
        isActive:false
      }
    })
    this.spaces.delete(spaceId);
    this.publishDeactivation(spaceId);

  }
}    