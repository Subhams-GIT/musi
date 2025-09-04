"use client";
import React, { useEffect,useRef,useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Track,
  Avatar,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ScrollArea,
} from "../app/utils/utils";
import {
  YoutubeIcon,
  MusicIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  PlayIcon,
  XIcon,
  QueueIcon,
} from "../app/utils/icons";
import handleVote, { removefromActive } from "../app/utils/vote";
// import { getsctive } from "../app/utils/GetActive";
import { ChevronUpCircleIcon } from "lucide-react";


const Queue = ({ queue, setQueue, setCurrentTrack }: any) => {
  
  const [error,setError]=useState("");
  useEffect(() => {
    setCurrentTrack(queue[0] || null);
  }, [queue.length]);


  const handle=async (track:Track,choice:"up"|"down")=>{
    try {
      await handleVote(track.id,choice)
      
      setQueue(queue.map((t:Track)=>{
        if(t.id==track.id)  return { ...t, upvotes: choice==="up"?t.upvotes+1:t.upvotes-1 };
        return t;
      }));
    } catch (error) {
      console.log(error)
    }
  }
  
  const sortedQueue = queue.length > 1
    ? [...queue].sort((a: Track, b: Track) => b.upvotes - a.upvotes)
    : [queue];

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
                    <span className="text-xs text-gray-500 w-6">{index + 1}</span>
                    <Avatar
                      src={track?.smallThumbnail || "/next.svg"}
                      alt={track?.title}
                      fallback={
                        track.type === "Youtube" ? <YoutubeIcon /> : <MusicIcon />
                      }
                      className="h-8 w-8"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-gray-900">
                        {track.title}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{track.artist}</p>
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
                          <Button
                            size="sm"
                            onClick={()=>handle(track,"up")}
                            className="h-10 w-10 p-2 rounded-full text-black text-2xl"
                          >
                            <ChevronUpCircleIcon />
                          </Button>
                          <span>{track.upvotes}</span>
                          <Button
                            size="sm"
                            onClick={() => handle(track, "down")}
                            className="h-10 w-10 p-2 rounded-full  text-black text-2xl"
                          >
                            <ChevronDownIcon />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setCurrentTrack(track);
                            setQueue((prev: any) =>
                              prev.filter((t: any) => t.id !== track.id)
                            );
                          }}
                        >
                          <PlayIcon />
                          <span className="ml-2">Play Now</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>{
                            
                            removefromActive(track.id,false).then(()=>{
                              setQueue((prev: any[]) =>
                              prev.filter((p) => p.id !== track.id)
                            )
                            }).catch((error)=>{
                              setError(error.toString())
                            })
                          }
                          }
                        >
                          <XIcon />
                          <span className="ml-2">Remove</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default Queue;
