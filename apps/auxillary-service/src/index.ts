import { WebSocketServer } from "ws";
import { v4 } from "uuid";
import { streamManager } from "./streammanager.js";
const manager = streamManager.getInstance();

export const wss = new WebSocketServer({ port: 8080 });
const connectedclients = new Set();
const currentsongstate = {
  song: null,
  isplaying: false, // Fixed: was null, should be boolean
};

wss.on("connection", (ws) => {
  console.log("New client connected");

  const clientid = v4();
  connectedclients.add(clientid);

  ws.onerror = (error) => {
    console.error("WebSocket error:", error); // Fixed: was incomplete
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data.toString()); // Fixed: convert buffer to string
      console.log("Received message type:", message.type);

      switch (message.type) {
        case "playsong":
          currentsongstate.song = message.song; // Fixed: update state
          currentsongstate.isplaying = true;
          wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
              client.send(
                JSON.stringify({
                  type: "playsong",
                  song: message.song,
                  isPlaying: true,
                }),
              );
            }
          });
          break;

        case "pausesong":
          currentsongstate.isplaying = false;
          wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
              client.send(
                JSON.stringify({
                  type: "pausesong",
                  song: currentsongstate.song,
                  isPlaying: false,
                }),
              );
            }
          });
          break;

        case "currentsong":
          currentsongstate.song = message.song;
          currentsongstate.isplaying = message.isPlaying || false;
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === client.OPEN) {
              client.send(
                JSON.stringify({
                  type: "currentsong",
                  song: currentsongstate.song,
                  isPlaying: currentsongstate.isplaying,
                }),
              );
            }
          });
          break;

        case "sync":
          // console.log('Sync requested, sending current state:', currentsongstate);
          ws.send(
            JSON.stringify({
              type: "currentsong",
              song: currentsongstate.song,
              isPlaying: currentsongstate.isplaying,
            }),
          );
          break;
        case "createRoom":
          const roomid = message.roomid;
          const userid = message.userid;
          const token = message.token;
          manager.createRoom(roomid, userid, ws, token);
          break;
        case "joinRoom":
          const room = message.roomid;
          const joinerid = message.userid;
          const jointoken = message.token;
          manager
            .joinRoom(room, joinerid, ws, jointoken)
            .then((data) => {
              console.log(`${userid} joined `);
            })
            .catch((err) => {
              console.error(err);
            });
          break;
        case "vote":
          const stream = message.streamID;
          const user = message.userID;
          const vote = message.choice;
          manager.vote(stream, user, vote).catch((e) => {});
          break;
        // case 'addStream':
        //   const streamurl = message.streamUrl;
        //   const streamid = message.streamID;
        //   const userID = message.userID;
        // manager.addStream(streamurl,streamid,userID)
        default:
          console.log("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  ws.onclose = () => {
    console.log("Client disconnected");
    connectedclients.delete(clientid);
  };
});

console.log("WebSocket server running on port 8080");
