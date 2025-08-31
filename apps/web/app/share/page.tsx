"use client";

import {useSearchParams} from "next/navigation";
import {useCallback, useEffect, useRef, useState} from "react";
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
import {Avatar, Badge, Button} from "../../app/utils/utils";
import {WebSocketContext} from "../../app/Context/wsContext";

const opts: YouTubeProps["opts"] = {
  height: "10",
  width: "1",
  playerVars: {
    autoplay: 0,
    controls: 0,
    modestbranding: 1,
    showinfo: 0,
    loop: 0,
    rel: 0,
  },
};

export default function Page() {
  const ws = useContext(WebSocketContext);
  const hashedId = useSearchParams().get("h");
  const [playerReady, setPlayerReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const playerRef = useRef<any>(null);
  const videoId = currentTrack?.url?.split("v=")[1];

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);

        switch (data.type) {
          case "currentsong":
            console.log("Current song data:", data.song);
            setCurrentTrack(data.song);
            setIsPlaying(data.isPlaying || false);

            if (playerReady && playerRef.current && data.isPlaying) {
              playerRef.current.playVideo();
            }
            setTimeout(() => {
              if (playerRef.current) {
                if (data.isPlaying) {
                  playerRef.current.playVideo();
                } else {
                  playerRef.current.pauseVideo();
                }
              }
            }, 1000);
            break;

          case "playsong":
            console.log("Play song data:", data.song);
            setCurrentTrack(data.song);
            setIsPlaying(true);

            setTimeout(() => {
              if (playerRef.current) {
                playerRef.current.playVideo();
              }
            }, 1000);
            break;

          case "pausesong":
            console.log("Pause song received");
            setIsPlaying(false);
            if (playerRef.current) {
              playerRef.current.pauseVideo();
            }
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    },
    [ws, playerReady, playerRef]
  );

  // useEffect(() => {
  //   if (!ws?.current) return;
  //   ws.current.onopen = () => {
  //     ws?.current?.addEventListener("message", handleMessage);
  //   };
  //   return () => {
  //     ws.current?.removeEventListener("message", handleMessage);
  //   };
  // }, [ws, handleMessage]);

  useEffect(() => {
    setTimeout(() => {
      if (!ws?.current) return;
      console.log("WebSocket state:", ws?.current.readyState);
      ws?.current?.addEventListener("message", handleMessage);
      ws.current.send(JSON.stringify({type: "sync"}));
    }, 1000);
   
  }, [ws]);
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MusicIcon className="text-blue-500" />
            Now Playing
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentTrack && videoId ? (
            <div className="flex flex-col gap-4">
              <div className="mx-auto">
                <YouTube
                  videoId={videoId}
                  opts={opts}
                  onReady={(event) => {
                    console.log("YouTube player ready");
                    playerRef.current = event.target;
                    setPlayerReady(true);
                    setTimeout(() => {
                      event.target.playVideo();
                    }, 500);
                  }}
                  onStateChange={(event) => {
                    console.log("YouTube player state change:", event.data);
                    if (event.data === 1) {
                      // playing
                      setIsPlaying(true);
                    } else if (event.data === 2) {
                      // paused
                      setIsPlaying(false);
                    }
                  }}
                  onError={(error) => {
                    console.error("YouTube player error:", error);
                  }}
                  className="rounded-lg overflow-hidden shadow-md"
                />
              </div>

              <div className="flex items-center gap-4 mt-4">
                <Avatar
                  src={
                    currentTrack.smallThumbnail ||
                    currentTrack.largeThumbnail ||
                    "/next.svg"
                  }
                  alt={currentTrack.title}
                  fallback={
                    currentTrack.type === "Youtube" ? (
                      <YoutubeIcon className="text-red-500" />
                    ) : (
                      <MusicIcon className="text-green-500" />
                    )
                  }
                  className="h-16 w-16 rounded-lg overflow-hidden shadow-sm"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {currentTrack.title}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {currentTrack.artist}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={
                        currentTrack.type === "Youtube"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
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
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center">
              <MusicIcon className="h-12 w-12 text-gray-300 mb-2" />
              <p>No track selected</p>
              <p className="text-sm mt-1">
                {wsConnected
                  ? "Waiting for sync from server..."
                  : "Connecting to server..."}
              </p>
              <div className="mt-2 text-xs">
                <p className={wsConnected ? "text-green-600" : "text-red-600"}>
                  WebSocket: {wsConnected ? "Connected" : "Connecting..."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
