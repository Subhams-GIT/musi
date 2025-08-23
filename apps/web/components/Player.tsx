"use client";
import React, {useState, RefObject, useEffect, useContext} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Track,
} from "../app/utils/utils";
import YouTube, {YouTubeProps} from "react-youtube";
import {
  MusicIcon,
  YoutubeIcon,
  SkipBackIcon,
  SkipForwardIcon,
  PlayIcon,
  PauseIcon,
} from "lucide-react";
import {Avatar, Badge, Button} from "../app/utils/utils";
import {YouTubePlayer} from "react-youtube";
import {WebSocketContext} from "../app/Context/wsContext";

const opts: YouTubeProps["opts"] = {
  height: "10",
  width: "1",
  playerVars: {
    autoplay: 0,
    controls: 0,
    modestbranding: 1,
    showinfo: 0,
    loop: 0,
  },
};

type PlayerProps = {
  playerRef: YouTubePlayer;
  playNext: any;
  currentTrack: Track | undefined;
  ws: RefObject<WebSocket | null> | null;
};

const Player: React.FC<PlayerProps> = ({playerRef, playNext, currentTrack}) => {
  const ws = useContext(WebSocketContext);
  const [isPlaying, setIsPlaying] = useState(false);
  console.log(playerRef.current);
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
          {currentTrack ? (
            <div className="flex items-center gap-4">
              <YouTube
                onEnd={playNext}
                videoId={currentTrack?.url?.split("v=")[1]}
                opts={opts}
                onReady={(event) => {
                  ws?.current?.send(
                    JSON.stringify({type: "currentsong", song: currentTrack})
                  );
                  playerRef.current = event.target;
                }}
                onStateChange={(event) => {
                  if (event.data === YouTube.PlayerState.PLAYING) {
                    ws?.current?.send(
                      JSON.stringify({type: "playsong", song: currentTrack})
                    );
                  } else if (event.data === YouTube.PlayerState.PAUSED) {
                    ws?.current?.send(
                      JSON.stringify({type: "pausesong", song: currentTrack})
                    );
                  }
                }}
                className="h-10 w-1 z-10"
              />
              <Avatar
                src={
                  currentTrack?.smallThumbnail ||
                  currentTrack?.largeThumbnail ||
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
                className="h-16 w-16 overflow-hidden "
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
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <SkipBackIcon />
                </Button>
                <Button
                  size="icon"
                  onClick={() => {
                    if (!playerRef.current) return;

                    if (isPlaying) {
                      playerRef.current.pauseVideo();
                    } else {
                      playerRef.current.playVideo();
                    }

                    setIsPlaying(!isPlaying);
                  }}
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </Button>
                <Button variant="outline" size="icon" onClick={playNext}>
                  <SkipForwardIcon />
                </Button>
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
};

export default Player;
