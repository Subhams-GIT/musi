"use client";

import {useSearchParams} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import React, {useContext} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Track,
} from "../../app/utils/utils";
import YouTube, {YouTubeProps} from "react-youtube";
import {MusicIcon, YoutubeIcon} from "lucide-react";
import {Avatar, Badge} from "../../app/utils/utils";
import {WebSocketContext} from "../../app/Context/wsContext";

const opts: YouTubeProps["opts"] = {
  height: "10",
  width: "10",
  playerVars: {
    autoplay: 0,
    controls: 0,
    modestbranding: 1,
    showinfo: 0,
    loop: 0,
  },
};

export default function Page() {
  const hashedId = useSearchParams().get("h");
  const ws = useContext(WebSocketContext);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);
  const videoId = currentTrack?.url.split("v=")[1];
  const syncSent = useRef(false);

  useEffect(() => {
    if (!ws?.current) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received:", data);

        if (data.type === 'currentsong') {
          setCurrentTrack(data.song);
          setIsPlaying(data.isPlaying || false);
        } else if (data.type === 'playsong') {
          setIsPlaying(true);
        } else if (data.type === 'pausesong') {
          setIsPlaying(false);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    // Add event listener
    ws.current.addEventListener('message', handleMessage);

    // Send sync request only once when connection is open
    if (ws.current.readyState === WebSocket.OPEN && !syncSent.current) {
      ws.current.send(JSON.stringify({ type: 'sync' }));
      syncSent.current = true;
      console.log("Sync request sent");
    }

    // Cleanup
    return () => {
      if (ws.current) {
        ws.current.removeEventListener('message', handleMessage);
      }
    };
  }, [ws]);


  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MusicIcon />
            Now Playing
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentTrack && videoId ? (
            <div className="flex items-center gap-4">
              <YouTube
                videoId={videoId}
                opts={opts}
                onReady={(event) => {
                  playerRef.current = event.target;
                }}
                className="hidden"
              />

              <Avatar
                src={
                  currentTrack.smallThumbnail ||
                  currentTrack.largeThumbnail ||
                  "/next.svg"
                }
                alt={currentTrack.title}
                fallback={
                  currentTrack.type === "Youtube" ? (
                    <YoutubeIcon />
                  ) : (
                    <MusicIcon />
                  )
                }
                className="h-16 w-16 overflow-hidden"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {currentTrack.title}
                </h3>
                <p className="text-sm text-gray-600">{currentTrack.artist}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={
                      currentTrack.type === "Youtube"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {currentTrack.type === "Youtube" ? "YouTube" : "Spotify"}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {currentTrack.duration}
                  </span>
                  <span className="text-sm text-gray-500">
                    {isPlaying ? "▶ Playing" : "⏸ Paused"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No track selected
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
