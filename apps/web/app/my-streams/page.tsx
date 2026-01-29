"use client";
import {
  Crown,
  CrownIcon,
  LeafyGreenIcon,
  Pause,
  Play,
  Share2,
  UserCheck,
  Users,
} from "lucide-react";
import SideBar, { Mobile_sidebar } from "Components/SideBar";
import { Button } from "utils/utils";
import { History, Hosted} from "utils/types";
import { useEffect, useState } from "react";
import NavBar from "@/Components/NavBar";
import useWindow from "hooks/window-hook";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Streamlayout } from "@/Components/StreamLayout";
import { useSpaces } from "@/store/store";
export default function Page() {
  const router=useRouter();
  const [open, setopen] = useState(false);
  const [allStreams, setallStreams] = useState<History>([]);
  const [originalStreams, setoriginalStreams] = useState<History>(allStreams);
  const [activeTab, setActivetab] = useState<string>("Hosted");
  const [searchInput, setsearchInput] = useState("");
  const windowsize = useWindow();
  const spaces=useSpaces();


useEffect(() => {
  console.log("before")
  if (!spaces.spaces?.length) {
    console.log("after5")
    axios
      .get(`${window.location.protocol}//${window.location.hostname}:3000/api/spaces`)
      .then((r) => {
        spaces.setspaces(r.data.returnSpaces);
        setallStreams(r.data.returnSpaces);
      });
  }
}, []);
useEffect(() => {
  if (spaces.spaces.length) {
    setallStreams(spaces.spaces);
    setoriginalStreams(spaces.spaces);
  }
}, [spaces.spaces]);
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (searchInput.trim() === "") {
      setallStreams(originalStreams);
    } else {
      timeout = setTimeout(() => {
        if (originalStreams) {
          const searchResult = originalStreams.filter((space) =>
            space.name.toLowerCase().includes(searchInput.trim().toLowerCase()),
          );
          setallStreams({
            ...searchResult,
          });
        }
      }, 500);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchInput, originalStreams]);

  return (
    <div className="flex min-h-screen min-w-screen ">
      {windowsize < 768 ? (
        <div className="w-full fixed left-0 top-0 z-10 text-white pt-5 px-4">
          <NavBar setopen={setopen} open={open} title="My Streams" />
          <Mobile_sidebar setmopen={setopen} mobopen={open} />
        </div>
      ) : (
        <div className="w-20 fixed left-0 top-0 z-10">
          <SideBar />
        </div>
      )}

      
      <div className="bg-white text-orange-500 flex-1 flex flex-col overflow-y-auto">
        {/* header */}
        {windowsize > 768 && (
          <section className="flex justify-around items-center w-full p-4 mt-4 px-10">
            <section className="flex  flex-col justify-center items-start gap-1 ">
              <section className="font-bold text-xl md:text-3xl ">
                My Streams
              </section>
              <section className="text-sm md:text-md text-gray-400">
                Manage streams you host and participate in{" "}
              </section>
            </section>
            <section className="">
              <Button
                className="flex items-center  bg-orange-400 text-white rounded-md gap-2 px-3 py-2 text-sm md:text-md"
                callback={() => router.push('/create-stream')}
              >
                <Play />
                Create
              </Button>
            </section>
          </section>
        )}

        
        <section className="w-full flex justify-center items-center  mt-10  pt-10 pb-4 ">
          <section className="w-full flex justify-center items-center">
            
            <input
              type="text"
              placeholder={`Search your streams ....`}
              onChange={(e) => setsearchInput(e.target.value)}
              className="w-[60%] h-[50px] py-3 rounded-md text-gray-700 flex justify-start items-center gap-2 shadow"
            />
          </section>
        </section>

        
        <section className="w-full flex items-center justify-center my-5">
          <section className="flex w-[60%] bg-orange-500 text-white justify-between items-center px-2 py-1 gap-5 rounded-md  ">
            <button
              name="Hosted"
              className={` w-[50%] px-4 rounded-md flex justify-center items-center py-1 gap-2 text-white ${activeTab === "Hosted" ? "border-b" : ""}`}
              onClick={() => setActivetab("Hosted")}
            >
              <Crown /> Hosted
            </button>

            <button
              name="Joined"
              className={` w-[50%] px-4 rounded-md flex justify-center items-center py-1 gap-2 text-white ${activeTab === "Joined" ? "border-b" : ""}`}
              onClick={() => setActivetab("Joined")}
            >
              {" "}
              <UserCheck /> Participated
            </button>
          </section>
        </section>

        
        <section className="w-full flex justify-center items-center">
          <div className="w-[60%] grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === "Hosted" &&
              allStreams.map(
                (space: any) =>
                  space.hosted && (
                    <div
                      key={space.id as string}
                      className="bg-white text-neutral-600 border border-none rounded-xl p-4 flex flex-col gap-4 shadow-md"
                    >
                      <section className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text">
                          <CrownIcon className="text-yellow-400" />
                          {space.name}
                        </span>
                        <span className="flex gap-2 items-center text-black bg-orange-300 rounded-lg px-1 ">
                          <section>
                            {space.isActive ? "live" : "paused"}
                          </section>
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
                      <section className="grid grid-cols-2 gap-2 ">
                        <section className="flex flex-col items-center justify-center">
                          <Users className="h-4 w-4 mb-1" />
                          <span className="text-xs">Joinees</span>
                          <span className="font-bold">
                            {space.joinees || 0}
                          </span>
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
                          <span className="font-bold">
                            {space.totalStreamTime}
                          </span>
                        </section>
                      </section>

                      <section className="w-full flex justify-between  items-center">
                        <a href={space.link} className="w-full">
                          {" "}
                          <button className=" w-[70%] flex justify-center items-center px-3 py-2  gap-6 bg-orange-500 text-black rounded-xl  ">
                            Join
                          </button>
                        </a>
                        <section className="flex justify-around items-center gap-2 ">
                          <button className="px-2 py-1 border border-neutral-700 rounded-md text-black text-sm"
                          onClick={()=>navigator.clipboard.writeText(space.link)}
                          >
                            <Share2 />
                          </button>
                          
                        </section>
                      </section>
                    </div>
                  ),
              )}
            {activeTab === "Joined" &&
              allStreams.map(
                (space) =>
                  !space.hosted && (
                    <Streamlayout key={space.id as string} {...space} />
                  ),
              )}
          </div>
        </section>
      </div>
    </div>
  );
}

