import { WebSocketServer } from "ws";
import { v4 } from "uuid";
import { streamManager } from "./streammanager.js";

const manager = streamManager.getInstance();
export const wss = new WebSocketServer({ port: 8080 });

const connectedClients = new Set<string>();
const currentSongState = {
  song: null as string | null,
  isPlaying: false,
};

wss.on("connection", (ws) => {
  console.log("New client connected");

  const clientId = v4();
  connectedClients.add(clientId);

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data.toString());
      console.log("Received message type:", message.type);

      switch (message.type) {
        case "playsong":
          currentSongState.song = message.song;
          currentSongState.isPlaying = true;
          broadcast({
            type: "playsong",
            song: message.song,
            isPlaying: true,
          });
          break;

        case "pausesong":
          currentSongState.isPlaying = false;
          broadcast({
            type: "pausesong",
            song: currentSongState.song,
            isPlaying: false,
          });
          break;

        case "currentsong":
          currentSongState.song = message.song;
          currentSongState.isPlaying = message.isPlaying || false;
          broadcastExcept(ws, {
            type: "currentsong",
            song: currentSongState.song,
            isPlaying: currentSongState.isPlaying,
          });
          break;

        case "sync":
          ws.send(
            JSON.stringify({
              type: "currentsong",
              song: currentSongState.song,
              isPlaying: currentSongState.isPlaying,
            })
          );
          break;

        case "joinRoom": {
          const roomId = message.roomId;
          const joinerId = message.userId;
          console.log(`Join room request: roomId=${roomId}, userId=${joinerId}`);
          if (!roomId ) throw new Error("Missing roomId or userId");
          try {
           const data = await manager.joinRoom(roomId);
            console.log(`${joinerId} joined room ${roomId}`);
          } catch (err) {
            console.error("joinRoom error:", err);
          }
        }
        break;

        case "vote": {  
          const { streamId, userId, choice } = message;
          if (streamId && userId && choice !== undefined) {
            try {
              
             // manager.vote(streamId, userId, choice).catch(console.error);
              
            } catch (error) {
              console.error(error)
            }
          }
        }
        break;

        // case "addStream": {
        //   const { streamUrl, streamId, userId } = message;
        //   if (streamUrl && streamId && userId) {
        //     try{
        //       const res=await manager.addStream(streamUrl, streamId, userId);
        //       broadcast({
        //         type:"added stream",
        //         res,
        //         userId
        //       })
        //     }
        //     catch(e){
        //       console.error(e)
        //     }
        //   }
        // }
        // break;
        default:
          console.log("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error parsing/handling message:", error);
    }
  };

  ws.onclose = () => {
    console.log("Client disconnected");
    connectedClients.delete(clientId);
  };
});

console.log("WebSocket server running on port 8080");


function broadcast(payload: object) {
  const data = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(data);
  });
}


function broadcastExcept(sender: any, payload: object) {
  const data = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client !== sender && client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}
