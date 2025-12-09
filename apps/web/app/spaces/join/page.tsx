"use client";

import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import ReactPlayer from "react-player";
import {
  Play,
  Pause,
  SkipForward,
  Search,
  ChevronUp,
  ChevronDown,
  Share2,
  Users,
  Clock,
  LogOut,
} from "lucide-react";

import { WebSocketContext } from "@/Context/wsContext";
import { Streams } from "@/utils/types";
import SideBar from "@/Components/SideBar";
// import useWindow from "@/hooks/window-hook";

type Participant = {
  id: string;
  name: string;
  isHost: boolean;
};

export default function StreamPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const params = useSearchParams();
  const token = params.get("t");
  let totalparticipants = useRef<Participant[]>([]);
  const context = useContext(WebSocketContext);

  const [isplaying, setIsPlaying] = useState(false);
  const [streams, setStreams] = useState<Streams[]>([]);
  const [currentStream, setCurrentStream] = useState<Streams | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [space, setSpace] = useState({
    name: "",
    id: "",
    description: "",
    link: "",
  });

  const [loading, setLoading] = useState(true);
  const [active, setIsActive] = useState<boolean | null>(null);
  const hasJoined = useRef(false);

  const [url, setUrl] = useState("");

  // ----------------------------
  // JOIN ROOM
  // ----------------------------
  useEffect(() => {
    if (!token || hasJoined.current) return;
    hasJoined.current = true;

    const joinRoom = async () => {
      try {
        const res = await axios.post(
          `${window.location.origin}/api/spaces/join?t=${token}`
        );

        const data = res.data.space;

        setStreams(data.streams || []);
        setCurrentStream(data.currentStream || null);
        // setParticipants(data.participants || []);
        console.log(data.participants);
        totalparticipants.current = data.participants;
        setSpace({
          name: data.name,
          id: data.id,
          description: data.description,
          link: data.link,
        });
        setIsActive(data.isActive);

        context?.sendMessage(
          JSON.stringify({
            type: "join-room",
            data: { token, userId: user?.id },
          })
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    joinRoom();
  }, [token, user?.id, context]);

  // ----------------------------
  // SORT STREAMS BY VOTES
  // ----------------------------
  const sortStreams = useCallback(() => {
    setStreams((prev) => {
      const sorted = [...prev].sort((a, b) => b.upvotes - a.upvotes);
      return sorted;
    });
  }, []);

  // ----------------------------
  // UPDATE currentStream when streams change
  // ----------------------------
  useEffect(() => {
    setCurrentStream(streams[0] || null);
  }, [streams]);

  // ----------------------------
  // SOCKET HANDLER
  // ----------------------------
  useEffect(() => {
    if (!context?.ws.current) return;

    const socket = context.ws.current;

    const handler = (msg: MessageEvent) => {
      try {
        const { type, data } = JSON.parse(msg.data);

        console.log("WS =>", type, data);

        switch (type) {
          case `new-stream/${space.id}`:
            setStreams((prev) => [...prev, data]);
            break;

          case `joined-space`:
            const updatedParticipants = data.usernames.userIDs;
            const actualListeners = totalparticipants.current.filter((p) =>
              updatedParticipants.includes(p.id)
            );

            setParticipants(actualListeners);
            break;

          case `user-left/${space.id}`:
            setParticipants((prev) => prev.filter((p) => p.id !== data.userID));
            break;

          case `new-vote/${space.id}`:
            setStreams((prev) =>
              prev.map((s) =>
                s.id === data.streamId
                  ? {
                      ...s,
                      upvotes: s.upvotes + (data.vote === "up" ? 1 : -1),
                    }
                  : s
              )
            );
            sortStreams();
            break;

          case "play-song":
            setIsPlaying(true);
            break;

          case "pause-song":
            setIsPlaying(false);
            break;

          case `space-deactivated/${space.id}`:
            setIsActive(false);
            break;
        }
      } catch (err) {
        console.error("WS error", err);
      }
    };

    socket.addEventListener("message", handler);

    return () => socket.removeEventListener("message", handler);
  }, [context?.ws, space.id, sortStreams]);

  // ----------------------------
  // ADD TO QUEUE
  // ----------------------------
  const addToQueue = useCallback(() => {
    if (!url.trim() || !space.id) return;

    context?.sendMessage(
      JSON.stringify({
        type: "add-to-queue",
        data: { spaceId: space.id, userId: user?.id, url },
      })
    );

    setUrl("");
  }, [url, space.id, user?.id, context]);

  // ----------------------------
  // VOTE
  // ----------------------------
  const voteForSong = useCallback(
    (songId: string, vote: "up" | "down") => {
      context?.sendMessage(
        JSON.stringify({
          type: "cast-vote",
          data: {
            userId: user?.id,
            streamId: songId,
            vote,
            spaceId: space.id,
          },
        })
      );
    },
    [space.id, user?.id, context]
  );

  // ----------------------------
  // MEDIA CONTROLS
  // ----------------------------
  const controlSong = useCallback(
    (action: "play-song" | "pause-song" | "skip-song") => {
      context?.sendMessage(
        JSON.stringify({
          type: action,
          data: {
            spaceId: space.id,
            streamId: currentStream?.id,
            userId: user?.id,
          },
        })
      );
    },
    [currentStream?.id, space.id, user?.id, context]
  );
  console.log({currentStream})
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-orange-500">
        Loading Space...
      </div>
    );

  if (active === false)
    return (
      <div className="h-screen flex items-center justify-center text-white bg-black">
        Space is no longer active
      </div>
    );

  const songsInQueue = streams.filter((s) => s.id !== currentStream?.id);
  const isHost = participants.find((p) => p.id === user?.id)?.isHost;

  const thumbnail = currentStream?.extractedId
    ? `https://img.youtube.com/vi/${currentStream.extractedId}/hqdefault.jpg`
    : "https://images.unsplash.com/photo-1470225620780-dba8ba36b745";

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <div className="hidden md:block w-20 fixed left-0 h-full">
        <SideBar />
      </div>

      <main className="flex-1 md:ml-20 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          
          <div className="col-span-12 flex justify-between">
            <div>
              <h1 className="text-3xl font-bold">{space.name}</h1>
              <p className="text-gray-500">ID: {space.id}</p>
            </div>

            <button
              onClick={() => navigator.clipboard.writeText(space.link)}
              className="px-4 py-2 bg-white border rounded-lg flex items-center gap-2 shadow"
            >
              <Share2 size={16} /> Share
            </button>
          </div>

         
          <div className="col-span-12 bg-white rounded-2xl p-6 shadow relative">
          
            {currentStream && (
              <ReactPlayer
                src={`https://www.youtube.com/watch?v=${currentStream.extractedId}`}
                playing={isplaying}
                width="0"
                height="0"
                className="z-[-999]"
                onEnded={() => controlSong("skip-song")}
              />
            )}

            <div className="flex gap-6 items-center">
              <img
                src={thumbnail}
                className="w-40 h-40 rounded-xl object-cover shadow"
              />

              <div className="flex-1">
                <p className="text-sm text-orange-600 font-semibold">
                  {currentStream ? "Now Playing" : "Nothing Playing"}
                </p>
                <h2 className="text-2xl font-bold">
                  {currentStream?.title || "Add a song to start"}
                </h2>
                <p className="text-gray-500">
                  {currentStream &&
                    `Added by ${currentStream.addedByUser?.name}`}
                </p>

                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() =>
                      controlSong(isplaying ? "pause-song" : "play-song")
                    }
                    disabled={!currentStream}
                    className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white"
                  >
                    {isplaying ? <Pause /> : <Play />}
                  </button>

                  <button
                    onClick={() => controlSong("skip-song")}
                    className="text-gray-600"
                  >
                    <SkipForward />
                  </button>
                </div>
              </div>
            </div>
          </div>

          
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-6 shadow flex flex-col">
            <h3 className="text-xl font-bold mb-4">Queue</h3>

         
            <div className="relative mb-4">
              <input
                className="w-full p-3 border rounded-xl pl-10"
                placeholder="Paste YouTube link"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addToQueue()}
              />
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={16}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {songsInQueue.length === 0 && (
                <div className="flex flex-col items-center mt-10 text-gray-400">
                  <Clock size={40} />
                  <p>No songs in queue</p>
                </div>
              )}

              {songsInQueue.map((track, idx) => (
                <div
                  key={track.id}
                  className="flex p-3 items-center bg-white border rounded-xl hover:bg-gray-50"
                >
                  <span className="w-6 text-gray-400">#{idx + 1}</span>

                  <div className="flex-1">
                    <p className="font-semibold">{track.title}</p>
                    <p className="text-xs text-gray-400">
                      {track.addedByUser?.name}
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => voteForSong(track.id, "up")}
                      className="text-gray-400 hover:text-orange-600"
                    >
                      <ChevronUp />
                    </button>
                    <span className="text-sm font-bold">{track.upvotes}</span>
                    <button
                      onClick={() => voteForSong(track.id, "down")}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <ChevronDown />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

         
          <div className="col-span-12 lg:col-span-4">
            <div className="p-6 bg-white rounded-2xl shadow h-full flex flex-col">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users size={18} />
                Participants ({participants.length})
              </h3>

              <div className="flex-1 overflow-y-auto space-y-3">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <p>
                      {p.name} {p.id === user?.id && "(You)"}
                    </p>
                  </div>
                ))}
              </div>

              <button className="mt-4 py-2 border rounded-xl text-gray-600 flex items-center gap-2 justify-center">
                <LogOut size={16} />
                Leave Session
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
