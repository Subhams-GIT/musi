import { WebSocketServer } from "ws";
import { v4 } from "uuid";
const wss=new WebSocketServer({port:8080});
const connectedclients=new Set();
const currentsongstate={
	song:null,
	isplaying:null
};
wss.on('connection',(ws:WebSocket)=>{
	/*
	send same as receive for user 
	streamer
		-> {playsong}
		-> {pausesong}
		-> {currentsong}
	user 
		-> {sync}
	*/

	const clientid=v4();
	connectedclients.add(clientid)
	ws.onerror=(error)=>{
		console.error
	}

	ws.onmessage=(event:MessageEvent)=>{
		const message=JSON.parse(event.data);
		console.log(message.type)
		switch(message.type){
			case 'playsong':
		        wss.clients.forEach(client=>{
					client.send(JSON.stringify({type:'playsong',song:message.song,isplaying:true}))
				})			
			case 'pausesong':
				wss.clients.forEach(client=>{
					client.send(JSON.stringify({type:'pausesong',song:message.song,isplaying:false}))
				})
			case 'currentsong':
				currentsongstate.song=message.song;
				currentsongstate.isplaying=message.isplaying;
			case 'sync':
				ws.send(JSON.stringify({type:'currentsong',song:currentsongstate.song,isplaying:currentsongstate.isplaying}))
			
		}
	}

	ws.onclose=()=>{
		connectedclients.delete(clientid);
	}
})