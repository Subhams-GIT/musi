"use client";
import { LogOutIcon, Music } from "lucide-react";
import { useEffect, useState } from "react";
import { UserStatus } from "@/utils/types";
import SideBar, { Mobile_sidebar } from "@/Components/SideBar";
import NavBar from "@/Components/NavBar";
import useWindow from "@/hooks/window-hook";
import { signOut } from "next-auth/react";
import { useSpaces } from "@/store/store";

export default function Dashboard() {
  const [open, setopen] = useState(false);
  const totals = useSpaces((s) => s.totals);
  const setStatus = useSpaces((s) => s.setStatus);
  const [loading, setloading] = useState(false);

  const userStatus = totals ?? {
    "total Streams Done": -1,
    "total Participants": -1,
    "total Streams Attended": -1,
  };

  useEffect(() => {
    if (
      totals["total Participants"] == -1 ||
      totals["total Streams Attended"] == -1 ||
      totals["total Streams Done"] === -1
    )
      return;
    setloading(true);
    try {
      fetch(
        `${window.location.protocol}//${window.location.hostname}:3000/api/userStatus`,
      )
        .then((res) => res.json())
        .then((d) => {
          console.log({ d });
          setStatus({
            "total Participants": d.userStatus.totalStreamsDone,
            "total Streams Attended": d.userStatus.totalStreamsAttended,
            "total Streams Done": d.userStatus.PreviousSpaces,
          });
        });
    } catch (e) {
      console.log(e)
    }
    finally{
      setloading(false)
    }
  }, [totals, setStatus]);

  const windowsize = useWindow();
  

  
  if (windowsize < 768) {
    return (
      <div className="bg-white text-black min-h-screen w-full flex flex-col gap-10 p-6 md:p-10">
        <NavBar setopen={setopen} open={open} title="Stream Sync" />
        {open && <Mobile_sidebar setmopen={setopen} mobopen={open} />}

        <div className="flex flex-col gap-6 bg-white">
          <section className="text-left">
            <h1 className="text-2xl font-semibold mb-2">
              Welcome back to StreamSync
            </h1>
            <p className="text-gray-400">
              Manage your music streams and create collaborative playlists
            </p>
          </section>

          <section className="grid grid-cols-1 gap-4">
            {(Object.keys(userStatus) as (keyof UserStatus)[]).map((key) => (
              <div
                key={key}
                className="flex flex-col text-gray-200 gap-2 justify-center items-center border border-gray-700 rounded-lg p-4"
              >
                <span className="text-sm font-medium">{key}</span>
                <span className="text-2xl font-bold text-white">
                  {userStatus[key]}
                </span>
              </div>
            ))}
          </section>
        </div>

        <div className="flex flex-col gap-5 bg-white">
          <section className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Previous Streams</h2>
              <p className="text-sm text-gray-400">
                Your recently completed streaming sessions
              </p>
            </div>
            <button className="rounded-md px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 text-sm whitespace-nowrap transition-colors">
              View All
            </button>
          </section>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex min-h-screen bg-white">
        <SideBar />

        <div className="flex-1 text-orange-500 flex flex-col gap-10 p-10 overflow-auto">
          <nav className="flex justify-between items-center border-b border-gray-700 pb-4">
            <div className="flex gap-2 items-center text-lg font-semibold">
              <Music className="w-6 h-6" />
              <span>StreamSync</span>
            </div>
            <button
              className="flex items-center gap-2 bg-orange-300 hover:bg-gray-100 rounded-md px-4 py-2 text-black text-sm font-medium transition-colors cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOutIcon className="h-4 w-4" />
              Sign Out
            </button>
          </nav>

          <div className="flex flex-col gap-6">
            <section className="text-left">
              <h1 className="text-2xl font-semibold mb-2">
                Welcome back to StreamSync
              </h1>
              <p className="text-gray-400">
                Manage your music streams and create collaborative playlists
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(userStatus) as (keyof UserStatus)[]).map((key) => (
                <div
                  key={key}
                  className="flex flex-col text-gray-200 gap-2 justify-center items-center border border-gray-700 rounded-lg p-6"
                >
                  <span className="text-sm font-medium text-center text-orange-400">
                    {key}
                  </span>
                  <span className="text-3xl font-bold text-neutral-400 font-sans">
                    {userStatus[key]}
                  </span>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    );
  }
}
