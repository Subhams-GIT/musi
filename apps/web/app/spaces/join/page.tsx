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
  Volume2,
  Search,
  ChevronUp,
  ChevronDown,
  Share2,
  Users,
  Music,
  Clock,
  Trash2,
  LogOut,
} from "lucide-react";

// Assuming these types and context imports are correct based on your previous code
import { WebSocketContext } from "@/Context/wsContext";
import { Streams } from "@/utils/types";
import SideBar from "@/Components/SideBar";
import useWindow from "@/hooks/window-hook"; // Added back based on original component

// --- TYPES ---
type Participant = {
  id: string;
  name: string;
  isHost: boolean;
};

// --- MAIN PAGE LOGIC & UI COMBINED ---

export default function StreamPage() {
  let hostId = "";
  const { data: session } = useSession();
  const user = session?.user;
  const context = useContext(WebSocketContext);
  const [isplaying, setisplaying] = useState(false);
  const params = useSearchParams();
  const token = params.get("t");
  // const windowSize = useWindow();
  const [open, setOpen] = useState(false);
  const [streams, setStreams] = useState<Streams[]>([]);
  const [currentStream, setCurrentStream] = useState<Streams | null>(null);
  const [url, setUrl] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "", name: "", isHost: false },
  ]);
  const [space, setSpace] = useState({
    name: "",
    id: "",
    description: "",
    link: "",
  });
  const [loading, setLoading] = useState(false);
  const hasjoined = useRef(false);
  const currentSong = streams[0];
  const [active, setisactive] = useState<boolean | null>(null);
  useEffect(() => {
    if (hasjoined.current) return;
    hasjoined.current = true;
    if (!token) return;

    const joinRoom = async () => {
      try {
        setLoading(true);
        const res = await axios.post(
          `${window.location.origin}/api/spaces/join?t=${token}`
        );
        const data = res.data.space;
        context?.sendMessage(
          JSON.stringify({
            type: "join-room",
            data: { token, userId: user?.id },
          })
        );
        hostId = data.hostId;
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
      setCurrentStream(streams[0] || null);
    };

    const socket = context.ws.current;
    socket.onmessage = (msg) => {
      try {
        const { type, data } = JSON.parse(msg.data);
        console.log({ data });
        switch (type) {
          case `new-stream/${space.id}`:
            const user = participants.find((p) => p.id === data.addedBy);
            const addedstream = { ...data, addedByUser: user };

            setStreams((prev) => [...prev, data]);
            break;
          case `joined-space`:
            const totalParticipants: string[] = data.usernames.userIDs;
            const updatedParticipants: Participant[] = [];
            totalParticipants.forEach((userid: string) => {
              const isConnected = participants.findIndex(
                (p) => p.id === userid
              );
              if (participants[isConnected] != undefined && isConnected > -1) {
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
             console.log({streams},data.streamId)
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
    const extractedId = url;
    // if(streams.s.) return new Error('song already present in the queue');
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
      // console.log("vote send");

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
  const leaveSpace = useCallback(() => {
    context?.sendMessage(
      JSON.stringify({
        type: "dismiss-space",
        data: { spaceId: space.id, userId: user?.id },
      })
    );
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-orange-500 bg-gray-50">
        Loading Space...
      </div>
    );
  if (active === false)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        Space is no longer active
      </div>
    );

  const thumbnail = currentStream?.extractedId
    ? `https://img.youtube.com/vi/${currentStream.extractedId}/hqdefault.jpg`
    : "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60";

  const songsInQueue = streams.filter((s) => s.id !== currentStream?.id);

  // --- UI RENDER (Combined into a single return statement) ---

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block w-20 fixed left-0 top-0 h-full z-20">
        <SideBar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-20 p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          {/* Header */}
          <div className="col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {space.name}
              </h1>
              <p className="text-gray-500 text-sm">Space ID: {space.id}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(space.link)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Share2 size={16} /> Share Invite
              </button>
            </div>
          </div>

          <div className="col-span-12 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>

            <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden">
              {user?.id === participants[0]?.id && currentStream && (
                <ReactPlayer
                  src={`https://www.youtube.com/watch?v=${currentStream.extractedId}`}
                  playing={isplaying}
                  width="0px"
                  height="0px"
                  onEnded={() => {
                    setStreams(
                      streams.filter(
                        (stream) =>
                          stream.extractedId != currentStream.extractedId
                      )
                    );
                  }}
                />
              )}
            </div>

            {/* Album Art/Thumbnail */}
            <div className="relative w-full md:w-48 h-48 flex-shrink-0 shadow-lg rounded-2xl overflow-hidden mb-6 md:mb-0">
              {currentStream ? (
                <img
                  src={thumbnail}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <Music size={40} />
                </div>
              )}
            </div>

            {/* Info & Controls */}
            <div className="md:ml-8 flex flex-col justify-center flex-grow w-full z-10">
              <span className="inline-block px-2 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-md mb-2">
                {currentStream ? "Now Playing" : "Waiting for music"}
              </span>
              <h2 className="text-2xl font-bold text-gray-800 line-clamp-1">
                {currentStream?.title || "No song playing"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {currentStream
                  ? `Added by ${currentStream.addedByUser?.name}`
                  : "Add a song to queue to start"}
              </p>

              <div className="flex items-center gap-6 mt-6">
                <button
                  onClick={() =>
                    controlSong(isplaying ? "pause-song" : "play-song")
                  }
                  disabled={!currentStream}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all 
                    ${
                      currentStream
                        ? "bg-orange-500 hover:bg-orange-600 hover:scale-105 shadow-orange-200 text-white"
                        : "bg-gray-200 cursor-not-allowed text-gray-400"
                    }`}
                >
                  {isplaying ? (
                    <Pause size={24} fill="currentColor" />
                  ) : (
                    <Play size={24} fill="currentColor" className="ml-1" />
                  )}
                </button>

                {currentStream && (
                  <button
                    onClick={() => {
                      /* Skip Logic */
                    }}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <SkipForward size={24} />
                  </button>
                )}

                <div className="flex items-center gap-3 ml-auto">
                  <Volume2 size={20} className="text-gray-400" />
                  <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-orange-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-800">Queue</h3>
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-medium">
                  {songsInQueue.length}
                </span>
              </div>
            </div>

            {/* Add Song Input */}
            <div className="relative mb-6 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addToQueue()}
                className="w-full pl-10 pr-24 py-3 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all outline-none"
                placeholder="Paste YouTube link here..."
              />
              <button
                onClick={addToQueue}
                disabled={loading || !url}
                className="absolute right-2 top-2 bottom-2 bg-white text-orange-600 px-3 text-xs font-semibold rounded-lg shadow-sm border border-gray-100 hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Song"}
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto pr-2 space-y-2 flex-1 scrollbar-thin">
              {songsInQueue.length > 0 ? (
                songsInQueue.map((track, idx) => (
                  <div
                    key={track.id}
                    className="flex items-center p-3 rounded-xl bg-white border border-transparent hover:border-gray-100 hover:shadow-sm hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <div className="w-8 font-medium text-sm text-gray-400">
                      #{idx + 1}
                    </div>

                    <div className="flex-1 min-w-0 mr-4">
                      <h4 className="text-sm font-semibold text-gray-700 truncate">
                        {track.title}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">
                        Added by {track.addedByUser?.name}
                      </p>
                    </div>

                    {/* Voting Micro-interaction */}
                    <div className="flex flex-col items-center gap-0.5 ml-auto">
                      <button
                        onClick={() => voteForSong(track.id, "up")}
                        className="text-gray-300 hover:text-orange-500 hover:-translate-y-0.5 transition-transform"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <span className="text-xs font-bold text-gray-600">
                        {track.upvotes}
                      </span>
                      <button
                        onClick={() => voteForSong(track.id, "down")}
                        className="text-gray-300 hover:text-red-500 hover:translate-y-0.5 transition-transform"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                  <Clock size={48} className="mb-2 opacity-50" />
                  <p>Queue is empty</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. PARTICIPANTS CARD (Span 4/12 on large screens) */}
          <div className="col-span-12 xl:col-span-4">
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 h-full max-h-[600px] xl:max-h-none sticky top-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">
                  Participants
                </h3>
                <div className="flex items-center gap-1 text-gray-400">
                  <Users size={16} />
                  <span className="text-sm">{participants.length}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-800 truncate">
                          {p.name} {p.id === user?.id && "(You)"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-6 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-sm font-medium hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2">
                <LogOut size={16} /> Leave Session
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
