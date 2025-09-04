"use client";
import {Button, Track} from "../utils/utils";
import {MusicIcon} from "../utils/icons";
import dynamic from "next/dynamic";
import {signOut, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import React, {useState, useEffect, useRef, useMemo, useContext} from "react";
import {YouTubePlayer} from "react-youtube";
const Player = dynamic(() => import("../../components/Player"));
const Search = dynamic(() => import("../../components/Search"));
const Queue = dynamic(() => import("../../components/Queue"));
import {Share2Icon} from "lucide-react";
import { getsctive } from "../utils/GetActive";
import { WebSocketContext } from "../Context/wsContext";

export default function StreamingDashboard() {
  const session = useSession();
  const ws = useContext(WebSocketContext)
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [queue, setQueue] = useState<Track[] | []>([]);
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");
  const router = useRouter();
  const [shareLink, setShareLink] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
      getsctive(session.data?.user.id).then((data) => {
        if (data) {
          setQueue(data);
        }
      });
    }, []);
  useEffect(() => {
    if (!session.data?.user) {
      router.replace("/");
      return;
    }
  }, []);

  const playNext = () => {
    if (queue.length === 0) {
      setCurrentTrack(undefined);
      return;
    } else if (queue.length >= 1) {
      setCurrentTrack(queue[0]);
      setQueue((prev) =>
        queue[0] ? prev.filter((p) => p.id !== queue[0]!.id) : prev
      );
    }
  };

  async function getlink() {
    try {
      const res = await fetch("http://localhost:3000/api/dashboard", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id: session.data?.user.id}),
      });
      // console.log("res", res);
      const data = await res.json();
      // console.log("redis",data)
      setShareLink(data.message);
      setShowModal(true);
    } catch (err) {
      console.error("Error getting share link:", err);
    }
  }

  useMemo(() => {
    if (!currentTrack) return;
    if (playerRef.current && currentTrack?.url) {
      currentTrack.url.split("v=")[1];
      if (isPlaying) {
        playerRef.current.playVideo();
      }
    }
  }, [currentTrack, playerRef]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
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
            >
              <Share2Icon className="h-4 w-4 mx-1" />
              Share
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6 my-10">
            {/* Now Playing Section */}
            <Player
              ws={ws}
              currentTrack={currentTrack}
              playerRef={playerRef}
              playNext={playNext}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 grid-rows-1">
              <Queue
                // ws={socket}
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
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-99">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-lg font-bold mb-4">Share this link</h2>
            <input
              type="text"
              value={shareLink}
              readOnly
              className="border px-2 py-1 w-full mb-4"
            />
            <div className="flex justify-center gap-2">
              <Button onClick={() => navigator.clipboard.writeText(shareLink)}>
                Copy Link
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
