'use client'
import {useContext, useEffect} from "react";
import React, {useState} from "react";
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  ScrollArea,
  Track,
} from "../app/utils/utils";
import {handlelistenerVote} from "../app/utils/functions";
import {QueueIcon, YoutubeIcon} from "../app/utils/icons";
import {
  MusicIcon,
  ArrowBigUpDash,
  ArrowBigDownDash
} from "lucide-react";
import { WebSocketContext } from "../app/Context/wsContext";
import { useSession } from "next-auth/react";

type sharedQueueProps = {
  streamerid: string;
};

export const SharedQeue = (props: sharedQueueProps) => {
  const hashedid = props.streamerid;
  const [queue, setQueue] = useState<Track[]>([]);
  const [error, setError] = useState("");
	const [streamerid,setstreamerid]=useState("")
  const [link,setlink]=useState("");
  const ws=useContext(WebSocketContext);
  const  session=useSession();

  useEffect(()=>{
    fetch('http://localhost:3000/api/getstream?id='+hashedid,{
      method:"GET",
      headers:{
        'Content-Type': 'application/json'
      },
    })
      .then((res)=>{
        res.json().then((streams) =>{
          console.log(streams.streams)
          setQueue(streams.streams)
          setstreamerid(streams.streamerID)
        })
        console.log(res)
      })
      .catch((err) => console.log(err));
    },[])

  const handle = async (track: Track, choice: "up" | "down") => {
    try {
      await handlelistenerVote(streamerid,track.id, choice);

      setQueue(
        queue.map((t: Track) => {
          if (t.id == track.id)
            return {
              ...t,
              upvotes: choice === "up" ? t.upvotes + 1 : t.upvotes - 1,
            };
          return t;
        })
      );
    } catch (error) {
      console.log(error);
    }
  };
 //const { streamUrl, streamId, userId } = message;
  const send_add_stream_request=()=>{
    ws?.current?.send(JSON.stringify({type:"addStream",streamUrl:link,streamId:hashedid,userId:session.data?.user.id}));  
   setlink(""); 
  }
  const sortedQueue =
    queue.length > 1
      ? [...queue].sort((a: Track, b: Track) => b.upvotes - a.upvotes)
      : queue;

  return (
    <div className="overflow-hidden rounded-lg h-fit bg-white shadow-sm">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QueueIcon />
              Queue ({queue.length}) {error}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Input onChange={e=>setlink(e.target.value)} value={link}/>
            <button onClick={send_add_stream_request}>Add a track to Queue</button>
            {queue.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <QueueIcon />
                <p className="mt-2">No tracks in queue</p>
                <p className="text-xs">Add songs to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedQueue.map((track: Track, index: number) => (
                  <div
                    key={`${track.id}-${index}`}
                    className="flex items-center gap-2 p-2 rounded-lg border border-gray-200"
                  >
                    <span className="text-xs text-gray-500 w-6">
                      {index + 1}
                    </span>
                    <Avatar
                      src={track?.smallThumbnail || "/next.svg"}
                      alt={track?.title}
                      fallback={
                        track.type === "Youtube" ? (
                          <YoutubeIcon />
                        ) : (
                          <MusicIcon />
                        )
                      }
                      className="h-8 w-8"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-gray-900">
                        {track.title}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {track.artist}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs font-medium ${
                            track.upvotes > 10
                              ? "text-green-600"
                              : track.upvotes < 10
                                ? "text-red-600"
                                : "text-gray-500"
                          }`}
                        >
                          {track.upvotes} votes
                        </span>
                        {track.addedBy && (
                          <span className="text-xs text-gray-500">
                            • {track.addedBy}
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            style={{ fontSize: '1.25rem', height: '2rem', width: '2rem', padding: '0.25rem' }}
                            onClick={() => handle(track, "up")}
                            className="h-5 w-5 p-2 rounded-full text-black text-2xl"
                          >
                            <ArrowBigUpDash/>
                          </button>
                          <span className="mx-3 my-2">{track.upvotes}</span>
                          <button
                            
                            style={{ fontSize: '1.25rem', height: '2rem', width: '2rem', padding: '0.25rem' }}
                            onClick={() => handle(track, "down")}
                            className=" sm h-5 w-5 p-2 rounded-full  text-black text-2xl"
                          >
                            <ArrowBigDownDash/>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
