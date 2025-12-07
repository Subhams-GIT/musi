"use client";
import React, { useContext, useState } from "react";
import useWindow from "@/hooks/window-hook";
import NavBar from "@/Components/NavBar";
import SideBar, { Mobile_sidebar } from "@/Components/SideBar";
import { WebSocketContext } from "@/Context/wsContext";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ActiveStreams() {
  const [open, setopen] = useState(false);
  const windowsize = useWindow();
  const session = useSession();
  const [loading, setloading] = useState(false);
  const [joinlink, setjoinLink] = useState<string>("");
  const ws = useContext(WebSocketContext);
  console.log(session);
  const router = useRouter();

  console.log(joinlink);
  return (
    <div className="flex flex-col justify-start items-center min-h-screen w-screen overflow-y-auto  bg-white text-orange ">
      {windowsize < 768 ? (
        <div className="w-full left-0 top-0 z-10 text-white pt-5 px-4">
          <NavBar setopen={setopen} open={open} title="My Streams" />
          <Mobile_sidebar setmopen={setopen} mobopen={open} />
        </div>
      ) : (
        <div className="w-20 fixed left-0 top-0 z-10">
          <SideBar />
        </div>
      )}

      <div className="w-full ">
        {windowsize > 768 ? (
          <section className="flex justify-around items-start w-full p-4  px-10">
            <section className="flex  flex-col justify-center items-start gap-1 ">
              <section className="font-bold text-xl md:text-3xl   text-orange-400">
                Join a Space with link
              </section>
              {/* <section className="text-sm md:text-md text-gray-400">Browse and join live music streaming sessions</section> */}
            </section>
          </section>
        ) : (
          <section className="flex justify-start items-center w-full p-4 mt-4 px-10">
            <section className="flex  flex-col justify-center items-start gap-1 ">
              <section className="font-bold text-xl md:text-3xl text-orange-400">
                Join a Space with link
              </section>
              {/* <section className="text-sm md:text-md text-gray-400">Browse and join live music streaming sessions</section> */}
            </section>
          </section>
        )}
      </div>
      {/* input box for search  */}
      <div className="w-[60%] shadow-md rounded-md mb-5 p-4 pt-10 ">
        <input
          type="text"
          onChange={(e) => setjoinLink(e.target.value)}
          placeholder="Give the url of the Space"
          className="w-full rounded-md border border-neutral-600 px-2 py-1 focus:outline-0"
        />
        <button
          disabled={loading}
          onClick={() => router.replace(joinlink)}
          className="w-full bg-black text-white px-2 py-1 rounded-md mt-4 cursor-pointer"
        >
          {loading ? "loading..." : "Join"}
        </button>
      </div>
    </div>
  );
}
