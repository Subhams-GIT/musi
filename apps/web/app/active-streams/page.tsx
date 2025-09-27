'use client'
import { useState } from "react";
import useWindow from "../../hooks/window-hook"
import NavBar from "../../Components/NavBar";
import SideBar, { Mobile_sidebar } from "../../Components/SideBar";
import { Button } from "../../utils/utils";
import { Play } from "lucide-react";
import { Hosted } from "../../utils/types";
import { Streamlayout } from "../my-streams/page";

export default function activeStreams() {
    const [open, setopen] = useState(false);
    const windowsize = useWindow();
    const [activeStreams, setactiveStreams] = useState<Hosted>({
        spaces: [
            {
                id: "6",
                name: "My Stream 1",
                streams: [],
                hostId: "user1",
                hostName: "User One",
                isActive: true,
                currentStream: "stream1",
                joinees: 5,
                myvotes: 10,
                mysongs: 2,
                hosted: true,
                totalStreamTime: 0
            },
            {
                id: "5",
                name: "My Stream 2",
                streams: [],
                hostId: "user1",
                hostName: "User One",
                isActive: true,
                currentStream: "stream1",
                joinees: 5,
                myvotes: 10,
                mysongs: 2,
                hosted: true,
                totalStreamTime: 0
            },
            {
                id: "1",
                name: "My Stream 3",
                streams: [],
                hostId: "user1",
                hostName: "User One",
                isActive: false,
                currentStream: "stream1",
                joinees: 5,
                myvotes: 10,
                mysongs: 2,
                hosted: false,
                totalStreamTime: 0
            },
            {
                id: "3",
                name: "My Stream 4",
                streams: [],
                hostId: "user1",
                hostName: "User One",
                isActive: false,
                currentStream: "stream1",
                joinees: 5,
                myvotes: 10,
                mysongs: 2,
                hosted: false,
                totalStreamTime: 0
            }
        ]
    })
    // Make the main container scrollable
    // Remove h-screen and overflow-hidden from the main div, add min-h-screen and overflow-y-auto
    return (
        <div className="flex flex-col justify-center items-center min-h-screen w-screen overflow-y-auto  bg-black text-white ">
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

            <div className="w-full flex">
                {windowsize > 768 ? <section className="flex justify-around items-center w-full p-4  px-10">
                    <section className="flex  flex-col justify-center items-start gap-1 ">
                        <section className="font-bold text-xl md:text-3xl text-white ">Active Streams</section>
                        <section className="text-sm md:text-md text-gray-400">Browse and join live music streaming sessions</section>
                    </section>
                    <section className="">
                        <Button className="flex items-center  bg-white text-black rounded-md gap-2 px-3 py-2 text-sm md:text-md" callback={() => alert("hello")}><Play />Create</Button>
                    </section>
                </section> : (
                    <section className="flex justify-start items-center w-full p-4 mt-4 px-10">
                        <section className="flex  flex-col justify-center items-start gap-1 ">
                            <section className="font-bold text-xl md:text-3xl text-white ">Active Streams</section>
                            <section className="text-sm md:text-md text-gray-400">Browse and join live music streaming sessions</section>
                        </section>
                    </section>
                )}
            </div>
            {/* input box for search  */}
            <div className="w-[70%] border border-neutral-600 rounded-md mb-5 p-4 pt-10 ">
                <input type="text" placeholder="Search Streams" className="w-full rounded-md border border-neutral-600 px-2 py-1 " />
            </div>

            {/* List of all currently active streams  */}
            <div className="w-[70%] grid grid-cols-1 md:grid-cols-2 gap-6">
                {
                    activeStreams.spaces.map(space=>(
                        <Streamlayout key={space.id as string} {...space}/>
                    ))
                }
            </div>
        </div>
    )
}