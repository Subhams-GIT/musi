"use client";
import { LogOutIcon, Music, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { UserStatus, Spaces } from "@/utils/types";
import SideBar, { Mobile_sidebar } from "@/Components/SideBar";
import NavBar from "@/Components/NavBar";
import useWindow from "@/hooks/window-hook";
import { signOut } from "next-auth/react";

export default function Page() {
  // const session = useSession();
  const [open, setopen] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus>({
    "total Streams Done": 0,
    "total Participants": 0,
    "total Streams Attended": 0,
  });
  const [history, sethistory] = useState<Spaces[]>([]);

  useEffect(() => {
    function fetchData() {
      fetch(`${window.location.protocol}//${window.location.hostname}:3000/api/userStatus`).then((d) => {
        d.json().then((d) => {
          // console.log(d.userStatus);
          setUserStatus({
            "total Participants": d.userStatus.totalStreamsDone,
            "total Streams Attended": d.userStatus.totalStreamsAttended,
            "total Streams Done": d.userStatus.PreviousSpaces,
          });
          sethistory(d.userStatus.spaces);
        });
      });
    }
    fetchData();
  }, []);

  // console.log(session.data?.user.id);

  const windowsize = useWindow();

  if (windowsize < 768) {
    return (
      <div className="bg-white text-black min-h-screen w-full flex flex-col gap-10 p-6 md:p-10">
        <NavBar setopen={setopen} open={open} title="Stream Sync" />
        {open && <Mobile_sidebar setmopen={setopen} mobopen={open} />}

        {/* User stats */}
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

        {/* Previous streams */}
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

          <section className="flex flex-col gap-4">
            {history.map((space, index) => (
              <div
                key={index}
                className="flex items-center gap-3 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
              >
                <div className="flex-shrink-0">
                  <Play className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-semibold truncate">{space.name}</span>
                  <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-sm">
                    <span className="text-gray-400">{space.hostName}</span>
                    <span className="text-gray-400">
                      Status: {space.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex min-h-screen bg-black">
        <SideBar />

        <div className="flex-1 text-white flex flex-col gap-10 p-10 overflow-auto">
          <nav className="flex justify-between items-center border-b border-gray-700 pb-4">
            <div className="flex gap-2 items-center text-lg font-semibold">
              <Music className="w-6 h-6" />
              <span>StreamSync</span>
            </div>
            <button
              className="flex items-center gap-2 bg-white hover:bg-gray-100 rounded-md px-4 py-2 text-black text-sm font-medium transition-colors cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOutIcon className="h-4 w-4" />
              Sign Out
            </button>
          </nav>

          {/* User stats */}
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
                  <span className="text-sm font-medium text-center">{key}</span>
                  <span className="text-3xl font-bold text-white">
                    {userStatus[key]}
                  </span>
                </div>
              ))}
            </section>
          </div>

          {/* Previous streams */}
          <div className="flex flex-col gap-5">
            <section className="flex gap-4 justify-between items-center">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold">Previous Streams</h2>
                <p className="text-gray-400">
                  Your recently completed streaming sessions
                </p>
              </div>
              <button className="rounded-md px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 text-sm whitespace-nowrap transition-colors">
                View All
              </button>
            </section>

            <section className="flex flex-col gap-4">
              {history.map((space, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <Play className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-2 min-w-0">
                    <span className="font-semibold text-lg">{space.name}</span>
                    <div className="flex gap-6 text-sm">
                      <span className="text-gray-400">{space.hostName}</span>
                      <span className="text-gray-400">
                        Status: {space.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    );
  }
}
