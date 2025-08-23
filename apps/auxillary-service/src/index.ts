import { WebSocketServer } from "ws";
import { v4 } from "uuid";

const wss = new WebSocketServer({ port: 8080 });
const connectedclients = new Set();
const currentsongstate = {
	song: null,
	isplaying: false // Fixed: was null, should be boolean
};

wss.on('connection', (ws) => {
	console.log('New client connected');
	
	const clientid = v4();
	connectedclients.add(clientid);

	ws.onerror = (error) => {
		console.error('WebSocket error:', error); // Fixed: was incomplete
	}

	ws.onmessage = (event) => {
		try {
			const message = JSON.parse(event.data.toString()); // Fixed: convert buffer to string
			console.log('Received message type:', message.type);
			
			switch(message.type) {
				case 'playsong':
					currentsongstate.song = message.song; // Fixed: update state
					currentsongstate.isplaying = true;
					wss.clients.forEach(client => {
						if (client.readyState === client.OPEN) { // Fixed: check connection state
							client.send(JSON.stringify({
								type: 'playsong',
								song: message.song,
								isPlaying: true
							}));
						}
					});
					break;
					
				case 'pausesong':
					currentsongstate.isplaying = false;
					wss.clients.forEach(client => {
						if (client.readyState === client.OPEN) { // Fixed: check connection state
							client.send(JSON.stringify({
								type: 'pausesong',
								song: currentsongstate.song,
								isPlaying: false
							}));
						}
					});
					break;
					
				case 'currentsong':
					currentsongstate.song = message.song;
					currentsongstate.isplaying = message.isPlaying || false; // Fixed: consistent naming
					// Broadcast to all other clients
					wss.clients.forEach(client => {
						if (client !== ws && client.readyState === client.OPEN) {
							client.send(JSON.stringify({
								type: 'currentsong',
								song: currentsongstate.song,
								isPlaying: currentsongstate.isplaying
							}));
						}
					});
					break;
					
				case 'sync':
					console.log('Sync requested, sending current state:', currentsongstate);
					ws.send(JSON.stringify({
						type: 'currentsong',
						song: currentsongstate.song,
						isPlaying: currentsongstate.isplaying // Fixed: consistent naming
					}));
					break;
					
				default:
					console.log('Unknown message type:', message.type);
			}
		} catch (error) {
			console.error('Error parsing message:', error);
		}
	}

	ws.onclose = () => {
		console.log('Client disconnected');
		connectedclients.delete(clientid);
	}
})

console.log('WebSocket server running on port 8080');