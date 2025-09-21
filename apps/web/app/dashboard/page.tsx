"use client";
import { Button, Track } from "../utils/utils";
import { MusicIcon } from "../utils/icons";
import dynamic from "next/dynamic";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useContext,
  useCallback,
} from "react";
import { YouTubePlayer } from "react-youtube";
const Player = dynamic(() => import("../../components/Player"));
const Search = dynamic(() => import("../../components/Search"));
const Queue = dynamic(() => import("../../components/Queue"));
import { LoaderCircle, Share2Icon } from "lucide-react";
import { getsctive } from "../utils/GetActive";
import { WebSocketContext } from "../Context/wsContext";


export default function StreamingDashboard() {
  const session = useSession();
  const ws = useContext(WebSocketContext);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [queue, setQueue] = useState<Track[] | []>([]);
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");
  const router = useRouter();
  const [shareLink, setShareLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [joined, setjoin] = useState(false);
  const [joinlink, setjoinlink] = useState("");
  const [loading,setisloading]=useState(false);

  useEffect(()=>{
    if(session.status==="authenticated"){
    queue && getsctive(session.data?.user.id).then((data) => {
      if (data) {
        setQueue(data);
      }
    });

    setTimeout(() => {
       if (!ws?.current) return;
        console.log("WebSocket state:", ws?.current.readyState);
        ws?.current?.addEventListener("message", handlemessage);
        return ()=>{
          ws?.current?.removeEventListener("message",handlemessage)
        }
    }, 1000);
    }
    else{
      router.replace("/")
    }
  }, [session,ws]);

  const playNext = () => {
    if (queue.length === 0) {
      setCurrentTrack(undefined);
      return;
    } else if (queue.length >= 1) {
      setCurrentTrack(queue[0]);
      setQueue((prev) =>
        queue[0] ? prev.filter((p) => p.id !== queue[0]!.id) : prev,
      );
    }
  };

  const joinStream = () => {
    setjoin(true)
    // router.replace(`/share?h=${joinlink}`);
  }

  const handlemessage =(event: MessageEvent) => {
    const { type, data } = JSON.parse(event.data);
    switch (type) {
      case "room created":
        console.log(data);
        break;
        case "user joined":
          console.log(data);
          break;
        }
      };
      
      
      
      if(session.status==="loading"){
        return <LoaderCircle/>
      }
  async function getlink() {
    try {
      if(loading) return;
      setisloading(true); 
      const res = await fetch("http://localhost:3000/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session.data?.user.id }),
      });
      const data = await res.json();
      sessionStorage.setItem("invite-link",data.message);
      console.log("before sending")
      ws?.current?.send(
        JSON.stringify({
          type: "createRoom",
          roomId: data.message.split("h=")[1],
          userId: session.data?.user.id,
          token: session.data?.user.accessToken,
        }),
      );
      console.log("after sending")
      setShareLink(data.message);
      setShowModal(true);
      setisloading(false)
    } catch (err) {
      console.error("Error getting share link:", err);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col lg:ml-0">
        <header className=" w-full flex justify-around items-center gap-4 h-16 px-4 bg-white border-b border-gray-200">
          <div className=" flex items-center gap-2 text-sm font-medium text-gray-900 justify-around">
            <MusicIcon />
            Streaming Dashboard
          </div>
          <div>
            <Button
              variant="outline"
              size="icon"
              className="text-black w-fit px-2 py-1"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-black w-fit px-1 py-1 mx-2"
              onClick={getlink}
              disabled={loading}
            >
              <Share2Icon className="h-4 w-4 mx-1" />
              {loading?<LoaderCircle className="animate-spin"/>:"create Room"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-black w-fit px-1 py-1 mx-2"
              onClick={joinStream}>
              <Share2Icon className="h-4 w-4 mx-1" />
              Join Room
            </Button>
          </div>
        </header>

        <div className="flex-1 p-4 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6 my-10">
            <Player
              ws={ws}
              currentTrack={currentTrack}
              playerRef={playerRef}
              playNext={playNext}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 grid-rows-1">
              <Queue
                queue={queue}
                setQueue={setQueue}
                currentTrack={currentTrack}
                setCurrentTrack={setCurrentTrack}
              />

              <Search
                queue={queue}
                setQueue={setQueue}
                session={session}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>
          </div>
        </div>
      </div>
      {
        joined && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-99">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center gap-4 ">
              <input type="text" onChange={e => setjoinlink(e.target.value)} />
              <button className="border -b px-2 py-1 bg-blue-500" onClick={() => {
                router.replace(joinlink)
              }}>join stream</button>
              <button onClick={() => setjoin(false)} className="px-2 py-1 rounded-full ">
               close
              </button>
            </div>
          </div>
        )
      }
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-99"> 
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-lg font-bold mb-4">Share this link</h2>
            <input
              type="text"
              value={shareLink.split("h=")[1]}
              readOnly
              className="border px-2 py-1 w-full mb-4"
            />
            <div className="flex justify-center gap-2">
              <Button onClick={() => navigator.clipboard.writeText(shareLink)}>
                Copy ID
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
