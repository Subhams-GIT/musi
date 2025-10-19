import { WebSocket, WebSocketServer } from "ws";
import cluster from "cluster";
import http from "http";
import dotenv from 'dotenv'
import SpaceManager from "./streammanager.js";
//@ts-ignore
import jwt from 'jsonwebtoken'
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });
const cors = 1; 
console.log(process.env.NEXTAUTH_SECRET)
if (cluster.isPrimary) {
  for (let i = 0; i < cors; i++) {
    cluster.fork();
  }

  cluster.on("disconnect", () => {
    process.exit(); 
  });
} else {
  main()
}
 
// spaceid userid -> token , ws 
// spaceid userid -> token , ws 
type Data = {
  userId: string;
  spaceId: string;
  token: string;
  url: string;
  vote: "up" | "down";
  streamId: string;

};

function createHttpServer() {
  return http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello, this is some data from the server!");
  });
}

async function handleConnection(ws: WebSocket) {
  ws.on("message", async (raw: { toString: () => string }) => {
    const { type, data } = JSON.parse(raw.toString()) || {};

    switch (type) {
      case "join-room":
        await handleJoinRoom(ws, data);
        break;
      default:
        await handleUserAction(ws, type, data);
    }
  });

  ws.on("close", () => {
    SpaceManager.getInstance().disconnect(ws);
  });
}

async function handleJoinRoom(ws: WebSocket, data: Data) {
  jwt.verify(
    data.token,
    process.env.NEXTAUTH_SECRET as string,
    (err: any, decoded: any) => {
      if (err) {
        console.error(err);
       ws.send(JSON.stringify({error:"not authenticated"}))
      } else {
        SpaceManager.getInstance().joinRoom(
          decoded.spaceId,
          decoded.creatorId,
          data.userId,
          ws,
          data.token
        );
      }
    }
  );
}

async function processUserAction(type: string, data: Data,ws:any) {
  switch (type) {
    case "cast-vote":
      await SpaceManager.getInstance().castVote(
        data.userId,
        data.streamId,
        data.vote,
        data.spaceId
      );
      break;

    case "add-to-queue":
      await SpaceManager.getInstance().addToQueue(
        data.spaceId,
        data.userId,
        data.url
      );
      break;

    case "play-next":
      await SpaceManager.getInstance().queue.add("play-next", {
        spaceId: data.spaceId,
        userId: data.userId,
      });
      break;

    case "remove-song":
      await SpaceManager.getInstance().queue.add("remove-song", {
        ...data,
        spaceId: data.spaceId,
        userId: data.userId,
      });
      break;

    case "empty-queue":
      await SpaceManager.getInstance().queue.add("empty-queue", {
        ...data,
        spaceId: data.spaceId,
        userId: data.userId,
      });
      break;


    default:
      console.warn("Unknown message type:", type);
  }
}

async function handleUserAction(ws: WebSocket, type: string, data: Data) {
  const user = SpaceManager.getInstance().users.get(data.userId);

  if (user) {
    data.userId = user.userId;
    await processUserAction(type, data,ws);
  } else {
    return new Error('user not found ')    
  }
}

async function main() {
  const server = createHttpServer();
  const wss = new WebSocketServer({ server });
  await SpaceManager.getInstance().initRedisClient();

  wss.on("connection", (ws) => handleConnection(ws));

  const PORT = process.env.PORT ?? 8080;
  server.listen(PORT, () => {
    console.log(`${process.pid}: WebSocket server is running on ${PORT}`);
  });
}