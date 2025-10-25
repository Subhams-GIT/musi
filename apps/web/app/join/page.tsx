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
  async function joinRoom(e: React.MouseEvent) {
    console.log("dsf");
    if (joinlink.trim() === "" || !joinlink.includes("?t=")) return;
    console.log("sdm");
    try {
      setloading(true);
      ws?.current?.send(
        JSON.stringify({
          type: "join-room",
          data: {
            token: joinlink.split("?t=")[1],
            ws,
            userId: session.data?.user.id,
          },
        }),
      );
      await axios.post(
        `http://localhost:3000/api/spaces/join?t=${joinlink.split("?t=")[1]}`,
      );
      setjoinLink("");
      setloading(false);
      router.push(joinlink);
    } catch (e) {
      console.error(e);
    } finally {
      setjoinLink("");
    }
  }
  console.log(joinlink);
  return (
    <div className="flex flex-col justify-start items-center min-h-screen w-screen overflow-y-auto  bg-black text-white ">
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
              <section className="font-bold text-xl md:text-3xl text-white ">
                Join a Space with link
              </section>
              {/* <section className="text-sm md:text-md text-gray-400">Browse and join live music streaming sessions</section> */}
            </section>
          </section>
        ) : (
          <section className="flex justify-start items-center w-full p-4 mt-4 px-10">
            <section className="flex  flex-col justify-center items-start gap-1 ">
              <section className="font-bold text-xl md:text-3xl text-white ">
                Join a Space with link
              </section>
              {/* <section className="text-sm md:text-md text-gray-400">Browse and join live music streaming sessions</section> */}
            </section>
          </section>
        )}
      </div>
      {/* input box for search  */}
      <div className="w-[70%] border border-neutral-600 rounded-md mb-5 p-4 pt-10 ">
        <input
          type="text"
          onChange={(e) => setjoinLink(e.target.value)}
          placeholder="Give the url of the Space"
          className="w-full rounded-md border border-neutral-600 px-2 py-1 "
        />
        <button
          disabled={loading}
          onClick={joinRoom}
          className="w-full bg-white text-black px-2 py-1 rounded-md mt-4 cursor-pointer"
        >
          {loading ? "loading..." : "Join"}
        </button>
      </div>
    </div>
  );
}
