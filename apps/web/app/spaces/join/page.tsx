"use client";
import {
  ChevronDown,
  ChevronUp,
  ChevronUpIcon,
  Clock,
  Music,
  Pause,
  Play,
  Plus,
  Settings,
  Share,
  SkipForward,
  Users,
  Volume2,
} from "lucide-react";
import useWindow from "@/hooks/window-hook";
import { useActionState, useContext, useEffect, useState } from "react";
import NavBar from "@/Components/NavBar";
import SideBar, { Mobile_sidebar } from "@/Components/SideBar";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { WebSocketContext } from "@/Context/wsContext";
// @ts-ignore

type currentStream = {
  id: string;
  userId: string;
  spaceId: string | null;
  streamId: string | null;
};

const staticQueue = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    duration: "3:20",
    votes: 8,
    addedBy: "Sarah Chen",
    isPlaying: true,
    progress: 45,
  },
  {
    id: "2",
    title: "Levitating",
    artist: "Dua Lipa",
    duration: "3:23",
    votes: 6,
    addedBy: "Mike Wilson",
    isPlaying: false,
    progress: 0,
  },
  {
    id: "3",
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    duration: "2:58",
    votes: 4,
    addedBy: "Emma Davis",
    isPlaying: false,
    progress: 0,
  },
  {
    id: "4",
    title: "Stay",
    artist: "The Kid LAROI, Justin Bieber",
    duration: "2:21",
    votes: 3,
    addedBy: "John Smith",
    isPlaying: false,
    progress: 0,
  },
];

const mockParticipants = [
  { id: "1", name: "Alex Johnson", isHost: true, isOnline: true },
  { id: "2", name: "Sarah Chen", isHost: false, isOnline: true },
  { id: "3", name: "Mike Wilson", isHost: false, isOnline: true },
  { id: "4", name: "Emma Davis", isHost: false, isOnline: false },
  { id: "5", name: "John Smith", isHost: false, isOnline: true },
];
import { useSession } from "next-auth/react";

const currentSong = staticQueue.find((song) => song.isPlaying);

export default function StreamPageStatic() {
  const session = useSession();
  const ws = useContext(WebSocketContext);
  const params = useSearchParams();
  const token = params.get("t");
  const windowsize = useWindow();
  const [open, setopen] = useState(false);
  const [streams, setstreams] = useState([]);
  const [currentstream, setcurrentstream] = useState<currentStream>({id:"",userId:"",spaceId:"",streamId:""});
  const [participant, setparticipants] = useState([]);
  const [space,setspace]=useState<{name:string,description:string}>();
  let showAddSong=false
  let showAddUser=false;
  useEffect(() => {
    async function joinRoom() {
      if (!token) return;
      try {
        const space = await axios.post(
          `http://localhost:3000/api/spaces/join?t=${token}`
        );
        console.log(space)
        ws?.current?.send(
          JSON.stringify({
            type: "join-room",
            data: { token, ws, userId: session.data?.user.id },
          })
        );
        setstreams(space.data.space.streams);
        setcurrentstream(space.data.space.currentStream.streamId);
        setparticipants(space.data.space.participants);
        setspace({name:space.data.space.name,description:space.data.space.description})

      } catch (error) {
        console.error(error);
      }
    }
    joinRoom();
  }, []);
  return (
    <div className="flex min-h-screen bg-gray-50 ">
      {windowsize < 768 ? (
        <div className="w-full fixed left-0 top-0 z-10 text-white pt-5 px-4 bg-black">
          <NavBar open={open} setopen={setopen} title={space?.name??""} />
          <Mobile_sidebar setmopen={setopen} mobopen={open} />
        </div>
      ) : (
        <div className="w-20 fixed left-0 top-0 z-10">
          <SideBar />
        </div>
      )}

      <main
        className={`flex-1 overflow-auto ${windowsize < 768 ? "pt-15" : "pt-5"} min-h-screen bg-black text-black h-full`}
      >
        <div className="p-6">
          {/* Stream Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {currentstream.streamId}
              </h1>
              {/* <p className="text-sm text-gray-500 ">
                Hosted by {mockStream.host} • {mockStream.participants}/
                {mockStream.maxParticipants} participants
              </p> */}
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <Share />
                Share
              </button>
              {currentstream.userId===session.data?.user.id && (
                <>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Users />
                    Add
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Settings />
                    Settings
                  </button>
                </>
              )}
            </div>
          </div>

          {showAddUser && (
            <div className="p-4 border border-blue-200   dark:bg-neutral-800 rounded-lg">
              <div className="text-lg font-semibold mb-1">
                Add User to Stream
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Send an invitation to join this stream
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Send Invite
                </button>
                <button className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content (xl:col-span-3) */}
            <div className="xl:col-span-3 space-y-6">
              {/* Now Playing Card */}
              <div className="p-6 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Music />
                  <h2 className="text-xl font-semibold">Now Playing</h2>
                </div>
                <div>
                  {currentstream ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Music className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">
                            {currentstream.streamId}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            {currentSong?.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Added by {currentSong?.addedBy}
                          </p>
                        </div>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 gap-1">
                          <ChevronUpIcon className="w-3 h-3" />
                          {currentSong?.votes}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                         
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>1:32</span>
                          <span>{currentSong?.duration}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-center gap-4 pt-2">
                        <button className="h-12 w-12 flex items-center justify-center border rounded-full text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                          {currentSong?.isPlaying ? <Pause /> : <Play />}
                        </button>
                        {currentstream.userId===session.data?.user.id && (
                          <button className="h-12 w-12 flex items-center justify-center border rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <SkipForward />
                          </button>
                        )}
                        <div className="flex items-center gap-2 ml-4">
                          <Volume2 />
                          {/* Basic Volume Slider Placeholder */}
                          <div className="w-24 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `75%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Music className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No song currently playing
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Queue Card */}
              <div className="p-6 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock />
                    <h2 className="text-xl font-semibold">
                      Queue ({staticQueue.filter((s) => !s.isPlaying).length}{" "}
                      songs)
                    </h2>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Plus />
                    Add Song
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Songs are ordered by votes. Vote to influence the queue!
                </p>

                {/* Add Song Modal (Static Display) */}
                {showAddSong && (
                  <div className="mb-6 p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="space-y-4">
                      {/* URL Input */}
                      <div className="space-y-2">
                        <label
                          htmlFor="song-url"
                          className="text-sm font-medium block"
                        >
                          Add from URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="song-url"
                            placeholder="Paste YouTube, Spotify, or SoundCloud URL"
                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                          />
                          <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                            Add from URL
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          OR
                        </span>
                        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                      </div>

                      {/* Manual Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium block">
                          Add manually
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            placeholder="Song title"
                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                          />
                          <input
                            placeholder="Artist"
                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                          Add to Queue
                        </button>
                        <button className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Queue List */}
                <div className="space-y-3">
                  {staticQueue
                    .filter((song) => !song.isPlaying)
                    .map((song, index) => (
                      <div
                        key={song.id}
                        className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono w-6">
                          #{index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{song.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {song.artist} • Added by {song.addedBy}
                          </p>
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {song.duration}
                        </div>

                        <div className="flex items-center gap-1">
                          <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-600">
                            <ChevronUp />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {song.votes}
                          </span>
                          <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600">
                            <ChevronDown />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {staticQueue.filter((s) => !s.isPlaying).length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      Queue is empty
                    </p>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 mx-auto">
                      <Plus />
                      Add the first song
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Participants Sidebar (xl:col-span-1) */}
            <div className="xl:col-span-1">
              <div className="p-6 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users />
                  <h2 className="text-xl font-semibold">
                    Participants ({mockParticipants.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {mockParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3"
                    >
                      <div className="relative flex-shrink-0">
                        {/* Avatar Placeholder */}
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold uppercase">
                          {participant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        {/* Status Dot */}
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                            participant.isOnline
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {participant.name}
                        </p>
                        {participant.isHost && (
                          <div className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded">
                            Host
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
