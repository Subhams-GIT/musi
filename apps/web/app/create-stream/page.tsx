"use client";

import NavBar from "@/Components/NavBar";
import SideBar, { Mobile_sidebar } from "@/Components/SideBar";
import { useContext, useState } from "react";
import useWindow from "@/hooks/window-hook";
import {
  Copy,
  Music,
  Settings,
  Users,
  SquareArrowOutUpRightIcon,
} from "lucide-react";
import axios from "axios";
import { WebSocketContext } from "@/Context/wsContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const windowsize = useWindow();
  const [open, setopen] = useState(false);
  const [spacename, setspaceanme] = useState("");
  const [spacedesc, setspacedesc] = useState("");
  const [streamcreated, setstreamcreated] = useState(false);
  const [createdSpace, setCreatedSpace] = useState({
    spaceName: "",
    description: "",
  });
  const [spacelink, setspacelink] = useState("");
  const session = useSession();
  const [loading, setloading] = useState(false);
  const ws = useContext(WebSocketContext);
  const navigate = useRouter();

  const createSpace = async () => {
    try {
      setloading(true);
      const res = await axios.post(`${window.location.protocol}//${window.location.hostname}:3000/api/spaces`, {
        spaceName: spacename,
        description: spacedesc,
      });
      setloading(false);
      setspacelink(res.data.link);
      navigate.replace(res.data.link);
      setCreatedSpace({
        spaceName: spacename,
        description: spacedesc,
      });
      setspaceanme("");
      setspacedesc("");
      setstreamcreated(true);
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-black via-neutral-900 to-indigo-950 min-h-screen w-full flex flex-col items-center py-8 px-2 md:px-8 gap-8">
      {/* Navigation */}
      <div className="w-full max-w-4xl">
        {windowsize < 768 ? (
          <div className="w-full text-white">
            <NavBar setopen={setopen} open={open} title="My Streams" />
            <Mobile_sidebar setmopen={setopen} mobopen={open} />
          </div>
        ) : (
          <div className="fixed left-0 top-0 z-20 h-full">
            <SideBar />
          </div>
        )}
      </div>

      {/* Page Title */}
      <div className="w-full max-w-2xl flex flex-col items-start gap-2 mt-8">
        <span className="text-2xl md:text-3xl font-bold text-white">
          Create New Stream
        </span>
        <span className="text-neutral-400 text-base md:text-lg">
          Set up a collaborative music streaming session
        </span>
      </div>

      {/* Stream Configuration */}
      <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        <div>
          <section className="flex items-center gap-2 text-white text-lg font-semibold mb-1">
            <Settings className="w-6 h-6" /> Stream Configuration
          </section>
          <section className="text-neutral-500 text-sm mb-4">
            Configure your streaming session settings
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-1">
            <label className="text-sm text-white font-medium">
              Stream Name
            </label>
            <input
              value={spacename}
              type="text"
              onChange={(e) => setspaceanme(e.target.value)}
              className="w-full rounded-md p-2 border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Friday Night Vibes"
            />
          </section>
          <section className="flex flex-col gap-1">
            <label className="text-sm text-white font-medium">
              Description
            </label>
            <textarea
              value={spacedesc}
              onChange={(e) => setspacedesc(e.target.value)}
              className="w-full rounded-md p-2 border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 text-base resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="A chill session for the weekend"
              rows={3}
            />
          </section>
          <section className="flex flex-col gap-1">
            <label className="text-sm text-white font-medium">
              Max Participants
            </label>
            <input
              type="number"
              min={1}
              max={100}
              className="w-full rounded-md p-2 border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="50"
              value={50}
              readOnly
            />
          </section>
        </div>

        <div className="flex flex-col gap-3">
          <section className="flex items-center justify-between bg-neutral-900 p-3 rounded-lg">
            <div>
              <span className="font-medium text-white text-sm">
                Public Stream
              </span>
              <div className="text-xs text-neutral-400">
                Allow anyone to discover and join
              </div>
            </div>
            <input type="checkbox" className="accent-indigo-600 w-5 h-5" />
          </section>
        </div>

        <button
          onClick={createSpace}
          className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-6 py-3 rounded-lg mt-4 shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base w-full justify-center"
        >
          <Music className="w-6 h-6" />{" "}
          {loading ? "creating ..." : "Create Space"}
        </button>
      </div>

      {streamcreated ? (
        <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow p-6 mt-4">
          <section className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6 text-white" />
            <span className="font-semibold text-white text-lg">
              Stream Preview
            </span>
          </section>
          <span className="text-neutral-400 text-sm mb-4">
            Preview how your stream will appear to participants
            <button onClick={() => navigate.replace(spacelink)}>
              <SquareArrowOutUpRightIcon />
            </button>
          </span>
          <section className="bg-neutral-900 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h5 className="text-white font-semibold">
                {createdSpace.spaceName}
              </h5>
              <span className="bg-indigo-600 text-white rounded-md text-xs px-2 py-1">
                Public
              </span>
            </div>
            <span className="text-neutral-300 text-sm">
              {createdSpace.description}
            </span>
            <span className="text-white flex-wrap ">
              {spacelink}
              <Copy onClick={() => navigator.clipboard.writeText(spacelink)} />
            </span>
            <div className="flex gap-4 items-center">
              <span className="flex items-center gap-1 text-white text-sm">
                <Users className="h-4 w-4" /> Max 50 Participants
              </span>
              <span className="rounded-xl border border-indigo-500 px-2 py-1 font-semibold text-indigo-400 text-xs">
                Voting Enabled
              </span>
            </div>
          </section>
        </div>
      ) : (
        <></>
      )}
      {/* Stream Preview */}
    </div>
  );
}
