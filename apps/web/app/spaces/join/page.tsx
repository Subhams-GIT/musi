"use client";

import {
  ChevronDown,
  ChevronUp,
  Clock,
  DeleteIcon,
  Music,
  Pause,
  Play,
  Settings,
  Share,
  SkipForward,
  Users,
  Volume2,
} from "lucide-react";
import { useContext, useEffect, useState, useCallback, useRef } from "react";
import NavBar from "@/Components/NavBar";
import SideBar, { Mobile_sidebar } from "@/Components/SideBar";
import useWindow from "@/hooks/window-hook";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { WebSocketContext } from "@/Context/wsContext";
import { useSession } from "next-auth/react";
import { Streams } from "@/utils/types";
import ReactPlayer from "react-player";


type Participant = {
  id: string;
  name: string;
  isHost: boolean;
};

export default function StreamPageStatic() {
  let hostId="";
  const { data: session } = useSession();
  const user = session?.user;
  const context = useContext(WebSocketContext);
  const [isplaying, setisplaying] = useState(false);
  const params = useSearchParams();
  const token = params.get("t");
  const windowSize = useWindow();
  const [open, setOpen] = useState(false);
  const [streams, setStreams] = useState<Streams[]>([]);
  const [currentStream, setCurrentStream] = useState<Streams | null>(null);
  const [url, setUrl] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([{id:"",name:"",isHost:false}]);
  const [space, setSpace] = useState({
    name: "",
    id: "",
    description: "",
    link: "",
  });
  const [loading, setLoading] = useState(false);
  const hasjoined = useRef(false);
  const currentSong = streams[0];
  const [active,setisactive]=useState<boolean|null>(null);
  useEffect(() => {
    if (hasjoined.current) return;
    hasjoined.current = true;
    if (!token) return;

    const joinRoom = async () => {
      try {
        setLoading(true);
        const res = await axios.post(
          `http://localhost:3000/api/spaces/join?t=${token}`
        );
        const data = res.data.space;
        context?.sendMessage(
          JSON.stringify({
            type: "join-room",
            data: { token, userId: user?.id },
          })
        );
        hostId=data.hostId;
        setisactive(data.isActive);
        console.log(data);
        setStreams(data.streams || []);
        setCurrentStream(data.currentStream || null);
        setParticipants(data.participants || []);
        setSpace({
          name: data.name,
          id: data.id,
          description: data.description,
          link: data.link,
        });

      } catch (error) {
        console.error("Error joining space:", error);
      } finally {
        setLoading(false);
      }
    };

    joinRoom();
  }, []);


  useEffect(() => {
    if (!context?.ws.current) return;
    const sortSongs = () => {
      setStreams((prev) =>
        prev
          .map((song) => song)
          .sort((a, b) =>
            a.upvotes === b.upvotes ? 0 : a.upvotes < b.upvotes ? 1 : -1
          )
      );
      setCurrentStream(streams[0]||null);
    };

    const socket = context.ws.current;
    socket.onmessage = (msg) => {
      try {
        const { type, data } = JSON.parse(msg.data);

        switch (type) {
          case `new-stream/${space.id}`:
            setStreams((prev) => [...prev, data]);
            break;

          case `joined-space`:
            const totalParticipants:string[]=data.usernames.userIDs;
            const updatedParticipants:Participant[]=[];
            totalParticipants.forEach((userid:string) => {
              const isConnected=participants.findIndex(p=>p.id===userid)
              if(participants[isConnected]!=undefined && isConnected>-1){
                updatedParticipants.push(participants[isConnected]);
              }
              });
            setParticipants(updatedParticipants);
            break;

          case `user-left/${space.id}`:
            setParticipants((prev) => prev.filter((p) => p.id !== data.userID));
            break;
          case `new-vote/${space.id}`:
            const stream = streams.find((s) => s.id === data.streamId);
            if (stream)
              setStreams((prev) =>
                prev.map((song) => {
                  if (song.id === stream.id)
                    return {
                      ...song,
                      upvotes: song.upvotes + (data.vote === "up" ? 1 : -1),
                    };
                  return song;
                })
              );
            sortSongs();
            break;
          case "play-song":
            setisplaying(true);
            break;
          case "pause-song":
            setisplaying(false);
            break;
          case "error":
            console.error(data.message);
            break;
           case `space-deactivated/${space.id}`:
            setisactive(false);
            break;
          default:
            console.warn("Unknown WebSocket message:", type);
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };
    sortSongs();
    return () => {
      socket.onmessage = null;
    };
  }, [context?.ws, space.id]);
  console.log(isplaying);

  const addToQueue = useCallback(() => {
    if (!url.trim() || !space.id || !user?.id) return;
    const extractedId=url.split("?v=")[1];
    if(streams.findIndex(s=>s.extractedId===extractedId)===-1) return new Error('song already present in the queue');
    console.log(context);
    setLoading(true);
    context?.sendMessage(
      JSON.stringify({
        type: "add-to-queue",
        data: { spaceId: space.id, userId: user.id, url },
      })
    );
    setUrl("");
    setLoading(false);
  }, [url, space.id, user?.id, context]);

  const voteForSong = useCallback(
    (songid: string, vote: string) => {
      console.log("vote send");

      context?.sendMessage(
        JSON.stringify({
          type: "cast-vote",
          data: {
            userId: session?.user.id,
            streamId: songid,
            vote,
            spaceId: space.id,
          },
        })
      );
    },
    [url, space.id, user?.id, context]
  );

  const controlSong = useCallback(
    (state: string) => {
      console.log("play send ");
      context?.sendMessage(
        JSON.stringify({
          type: state,
          data: {
            spaceId: space.id,
            streamId: currentSong?.id,
            userId: user.id,
          },
        })
      );
    },
    [context, user?.id, space.id]
  );
  const leaveSpace=useCallback(()=>{
    context?.sendMessage(JSON.stringify({
      type:"dismiss-space",
      data:{spaceId:space.id,userId:user?.id}
    }))
  },[]) 
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white italic animate-pulse">
        Joining...
      </div>
    );
  }
  else if(active){
    return (
    <div className="flex items-center justify-center h-screen bg-black text-red-400">
        Sorry the space is no more valid
    </div>
    )
  }
  return (
    <div className="flex min-h-screen bg-gray-50 text-white">
      {/* Sidebar */}
      {windowSize < 768 ? (
        <div className="w-full fixed left-0 top-0 z-10 text-white pt-5 px-4 bg-black">
          <NavBar open={open} setopen={setOpen} title={space.name} />
          <Mobile_sidebar setmopen={setOpen} mobopen={open} />
        </div>
      ) : (
        <div className="w-20 fixed left-0 top-0 z-10">
          <SideBar />
        </div>
      )}

      <main
        className={`flex-1 overflow-auto ${
          windowSize < 768 ? "pt-15" : "pl-20"
        } min-h-screen bg-black text-black h-full`}
      >
        <div className="p-6">
   
          <div className="flex items-center justify-between mb-6 text-white">
            <h1 className="text-2xl font-bold">{space.name}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(space.link)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Share /> Share
              </button>

              {currentStream?.userId === user?.id && (
                <>
                {hostId===user?.id && (
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>leaveSpace()}>
                    <DeleteIcon /> dismiss 
                  </button>
                )}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
           
            <div className="xl:col-span-3 space-y-6">
              
              <div className="p-6 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Music />
                  <h2 className="text-xl font-semibold">Now Playing</h2>
                </div>

                {currentSong ? (
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Music className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {currentSong.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Added by {currentSong.addedByUser.name}
                        </p>
                      </div>
                    </div>

                    {user?.id === participants[0]?.id && (
                      <ReactPlayer
                        src={`https://www.youtube.com/watch?v=${currentStream?.extractedId}`}
                        playing={isplaying}
                        className="inset-1 -z-10"
                        onEnded={() =>{
                          setCurrentStream(streams[1]||null);
                          setStreams(
                            streams.filter(
                              (song) => song.id !== currentStream?.id
                            )
                          )
                        }}
                      />
                    )}

                    <div className="flex items-center justify-center gap-4 pt-4">
                      <button className="h-12 w-12 flex items-center justify-center border rounded-full text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        {isplaying && participants[0]?.id === user?.id ? (
                          <Pause
                            onClick={() => {
                              controlSong("pause-song");
                              setisplaying(false);
                            }}
                          />
                        ) : (
                          <Play
                            onClick={() => {
                              controlSong("play-song");
                              setisplaying(true);
                            }}
                          />
                        )}
                      </button>
                      {currentStream?.userId === user?.id && (
                        <button className="h-12 w-12 flex items-center justify-center border rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                          <SkipForward />
                        </button>
                      )}
                      <div className="flex items-center gap-2 ml-4">
                        <Volume2 />
                        <div className="w-24 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: "75%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-green-400">
                    <Music className="w-12 h-12 mx-auto mb-4" />
                    No song currently playing
                  </div>
                )}
              </div>

              
              <div className="p-6 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock />
                    <h2 className="text-xl font-semibold">
                      Queue ({streams.filter((s) => !s.played).length})
                    </h2>
                  </div>
                </div>

                <div className="mb-6 flex gap-2">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste song URL (YouTube, Spotify, etc.)"
                    className="flex-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-700"
                  />
                  <button
                    onClick={addToQueue}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>

                {streams.length > 0 ? (
                  <div className="space-y-3">
                    {streams.map((song, i) => (
                      <div
                        key={song.extractedId}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      >
                        <div className="text-gray-500 w-6 text-center">
                          #{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="truncate">{song.title}</h4>
                          <p className="text-sm text-gray-400 truncate">
                            Added by {song.addedByUser.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <ChevronUp
                            onClick={() => voteForSong(song.id, "up")}
                          />
                          <span>{song.upvotes}</span>
                          <ChevronDown
                            onClick={() => voteForSong(song.id, "down")}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    Queue is empty. Add a song to get started!
                  </div>
                )}
              </div>
            </div>

       
            <div className="xl:col-span-1">
              <div className="p-6 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users />
                  <h2 className="text-xl font-semibold">
                    Participants ({participants.length})
                  </h2>
                </div>

                <div className="space-y-3">
                  {participants.length>0?( participants.map((p) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold uppercase">
                        {p.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        {p.isHost && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded">
                            Host
                          </span>
                        )}
                      </div>
                    </div>
                  ))):( 
                    <div className="text-center py-6 text-gray-400">
                    No participants yet.
                  </div>
                  )
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function JoinNoification(props: { user: string }) {
  return (
    <>
      <div className="bg-transparent text-green-500 bottom-0 left-[50%]">
        joined {props.user}
      </div>
    </>
  );
}
