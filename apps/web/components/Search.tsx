"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Track,
} from "../app/utils/utils";
import { SearchIcon, MusicIcon } from "lucide-react";
import {
  Input,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  ScrollArea,
} from "../app/utils/utils";
import useSession,{sessionData} from "nextauth/react";
import { useEffect, useState } from "react";
import { Avatar } from "../app/utils/utils";
import { PlusIcon } from "lucide-react";
import { ChevronUpIcon, ChevronDownIcon, YoutubeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import handleVote from "../app/utils/vote";
import { parseTrackFromUrl } from "../app/utils/functions";
const Search = ({ queue, setQueue, session, sortBy, setSortBy }: any) => {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState("");
  const [loading, setloading] = useState<boolean>(false);
  const [Mytracks, setMytracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [originaltracks, setoriginal] = useState<Track[]>([]);
  const [error, setError] = useState<String>("");
  //const session=useSession()
  const {data:sessionData,status}=session;
  useEffect(()=>{
    if(session.status==="unauthenticated") {
    router.replace("/")
    return ;
    }
  },[status,router])
  const addTrackFromUrl = async () => {
    if (!urlInput.trim()) return;

    const track = parseTrackFromUrl(urlInput);
    const duplicatetracks = Mytracks.find((tracks) => tracks.url === urlInput);
    if (duplicatetracks) {
      console.log(duplicatetracks);
      setError("duplicate tracks already present in list!");
      return;
    }

    if (track) {
      setloading(true);
      const res = await fetch("http://localhost:3000/api/streams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorId: session.data?.user.id ?? "",
          url: urlInput,
          type: urlInput.includes("youtube.com") ? "Youtube" : "Spotify",
        }),
      });
      setloading(false);
      const actualTrack = await res.json();
      setMytracks([...Mytracks, actualTrack]);
      console.log(actualTrack);
      setUrlInput("");
    } else {
      alert("Invalid URL. Please enter a valid YouTube or Spotify URL.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:3000/api/streams/my", {
        method: "GET",
      });

      const data = await response.json();
      setMytracks(data.streams);
      setoriginal(data.streams);
    };
    fetchData();
  }, [loading]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.trim() === "") {
        setMytracks(originaltracks);
        return;
      }

      const results: Track[] = originaltracks.filter((track) =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      setMytracks(results.length > 0 ? results : []);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery, originaltracks]);

  const addToQueue = (track: Track) => {
    if (queue.includes(track)) {
      return;
    }
    fetch("http://localhost:3000/api/streams/active", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ streamId: track.id, active: true }),
    })
      .then((d) => {
        if (queue.length === 0) {
          setQueue(track);
        } else setQueue((prev: any) => [...prev, track]);
      })
      .catch((err) => {
        console.error("Error adding to queue:", err);
      });
  };

  const filteredYouTubeTracks = Mytracks.filter(
    (track) => track.type === "Youtube",
  );

  const filteredSpotifyTracks = Mytracks.filter(
    (track: any) =>
      track.type === "Spotify" &&
      (track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="lg:col-span-5 w-full h-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchIcon />
              Add Music
            </CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search for songs, artists..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="flex-1"
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* URL Input Section */}
            <div className="mb-6 p-4 max-h-fit border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-gray-900">
                <PlusIcon />
                Add Track by URL
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste YouTube or Spotify URL here..."
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setError("");
                  }}
                  className="flex-1"
                />
                <Button onClick={addTrackFromUrl} disabled={loading}>
                  {loading ? "Adding Track" : "Add Track"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Supports YouTube and Spotify URLs <br />
                <strong className="text-red-500">{error}</strong>
              </p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900">Browse Music</h3>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "votes" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("upvotes")}
                >
                  Most Voted
                </Button>
                <Button
                  variant={sortBy === "recent" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("recent")}
                >
                  Recent
                </Button>
              </div>
            </div>

            <Tabs defaultValue="youtube" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="youtube"
                  className="flex items-center gap-2"
                >
                  <YoutubeIcon />
                  YouTube
                </TabsTrigger>
                <TabsTrigger
                  value="spotify"
                  className="flex items-center gap-2"
                >
                  <MusicIcon />
                  Spotify
                </TabsTrigger>
              </TabsList>

              <TabsContent value="youtube" className="mt-4 ">
                <ScrollArea className="h-[400px] pr-2">
                  <div className="space-y-2 pb-4">
                    {filteredYouTubeTracks
                      .sort((a: any, b: any) =>
                        sortBy === "votes" ? b.upVotes - a.upVotes : 0,
                      )
                      .map((track: any) => (
                        <div
                          key={track.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          <Avatar
                            src={
                              track.smallThumbnail ||
                              track.largeThumbnail ||
                              "/next.svg"
                            }
                            alt={track.title}
                            fallback={<YoutubeIcon />}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {track.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {track.artist}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {track.duration}
                              </span>
                              <span className="text-xs text-gray-500">
                                • Added by{" "}
                                {session.data?.user.name || "Unknown"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Voting buttons */}
                            <div className="flex items-center gap-1 mr-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleVote(track.id, "up")}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronUpIcon />
                              </Button>
                              <span
                                className={`text-sm font-medium min-w-[2rem] text-center ${
                                  track.upVotes > 10
                                    ? "text-green-600"
                                    : track.upVotes < 0
                                      ? "text-red-600"
                                      : "text-gray-600"
                                }`}
                              >
                                {track.upvotes}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleVote(track.id, "down")}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronDownIcon />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => addToQueue(track)}
                                className="h-10 w-10 p-0 bg-blue-600 text-white text-2xl "
                              >
                                <PlusIcon />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="spotify" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredSpotifyTracks
                      .sort((a: any, b: any) =>
                        sortBy === "votes" ? b.upVotes - a.upVotes : 0,
                      )
                      .map((track: any) => (
                        <div
                          key={track.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          <Avatar
                            src={track.smallThumbnail || "/next.svg"}
                            alt={track.title}
                            fallback={<MusicIcon />}
                            className="h-12 w-12 rounded-md object-cover absolute"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {track.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {track.artist}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {track.duration}
                              </span>
                              <span className="text-xs text-gray-500">
                                • Added by {track.addedBy}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Voting buttons */}
                            <div className="flex items-center gap-1 mr-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleVote(track.id, "up")}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronUpIcon />
                              </Button>
                              <span
                                className={`text-sm font-medium min-w-[2rem] text-center ${
                                  track.upVotes > 10
                                    ? "text-green-600"
                                    : track.upVotes < 0
                                      ? "text-red-600"
                                      : "text-gray-600"
                                }`}
                              >
                                {track.upVotes}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleVote(track.id, "down")}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronDownIcon />
                              </Button>
                            </div>

                            <Button
                              size="sm"
                              className="bg-black"
                              onClick={() => addToQueue(track)}
                            >
                              <PlusIcon />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Search;
