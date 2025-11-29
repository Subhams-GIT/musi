'use client';
import { Pause, Play, Users, LeafyGreenIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spaces } from "utils/types";
export function Streamlayout(space: Spaces) {
  const router = useRouter();
  return (
    <div
      key={space.id as string}
      className="bg-black border border-neutral-700 rounded-xl p-4 flex flex-col gap-4 shadow-md"
    >
      <section className="flex justify-between items-center">
        <span className="flex items-center gap-2 text-white">{space.name}</span>
        <span className="flex gap-2 items-center text-black bg-white rounded-lg px-1 ">
          <section>{space.isActive ? "live" : "paused"}</section>
        </span>
      </section>

      <section className="flex flex-col w-full bg-neutral-700 rounded-md p-2 items-start gap-2 text-white">
        <section className="flex justify-center items-center gap-2 ">
          {space.isActive ? (
            <span className="h-1 w-1 rounded-full animate-ping bg-green-500" />
          ) : (
            <Pause className="h-3 w-3" />
          )}
          <span className="text-sm">
            {space.isActive ? "NOW PLAYING" : "PAUSED"}
          </span>
        </section>
        {space.name}
      </section>

      {/* Improved grid layout */}
      <section className="grid grid-cols-2 gap-2 text-white">
        <section className="flex flex-col items-center justify-center">
          <Users className="h-4 w-4 text-white mb-1" />
          <span className="text-xs">Joinees</span>
          <span className="font-bold text-white">{0}</span>
        </section>
        <section className="flex flex-col items-center justify-center">
          <LeafyGreenIcon className="h-4 w-4 text-green-400 mb-1" />
          <span className="text-xs">Votes</span>
          <span className="font-bold">{space.myvotes}</span>
        </section>
        <section className="flex flex-col items-center justify-center">
          <Play className="h-4 w-4 text-blue-400 mb-1" />
          <span className="text-xs">Songs</span>
          <span className="font-bold">{space.mysongs}</span>
        </section>
        <section className="flex flex-col items-center justify-center">
          <Pause className="h-4 w-4 text-gray-400 mb-1" />
          <span className="text-xs">Stream Time</span>
          <span className="font-bold">{space.totalStreamTime}</span>
        </section>
      </section>

      <div className=" flex justify-center w-full rounded-md  bg-white text-black ">
        <button
          className="flex justify-center items-center gap-2 px-2 py-2"
          onClick={() => router.push(`${space.link}`)}
        >
          <Play /> Join Stream
        </button>
      </div>
    </div>
  );
}