'use client'
import { Crown, CrownIcon, LeafyGreenIcon, Pause, Play, Search, UserCheck, Users } from "lucide-react"
import SideBar, { Mobile_sidebar } from "../../Components/SideBar"
import { Button } from "../../utils/utils"
import { Hosted } from "../../utils/types"
import { useState } from "react"
import NavBar from "../../Components/NavBar"
export default function Page() {
    const [open, setopen] = useState(false)
    const [allStreams, setallStreams] = useState<Hosted>({
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
            },
            {
                id: "5",
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
            },
            {
                id: "1",
                name: "My Stream 1",
                streams: [],
                hostId: "user1",
                hostName: "User One",
                isActive: false,
                currentStream: "stream1",
                joinees: 5,
                myvotes: 10,
                mysongs: 2,
                hosted: false,
            },
            {
                id: "3",
                name: "My Stream 1",
                streams: [],
                hostId: "user1",
                hostName: "User One",
                isActive: false,
                currentStream: "stream1",
                joinees: 5,
                myvotes: 10,
                mysongs: 2,
                hosted: false,
            }
        ]
    })
    const [activeTab, setActivetab] = useState<string>("Hosted");

    return <div className="flex h-screen w-screen overflow-hidden">
        {/* Make sidebar fixed and full height */}
        <div className="h-screen fixed left-0 top-0 z-10">
            {open && <NavBar setopen={setopen} open={open} />}
            {open && <Mobile_sidebar setmopen={setopen} mobopen={open} />}
        </div>
        {/* Main content with left margin to accommodate sidebar */}
        <div className="bg-black flex-1 flex flex-col h-screen  overflow-y-auto">
            {/* header */}
            <section className="flex justify-between items-center w-full p-4 mt-4">
                <section className="flex  flex-col justify-center items-start gap-1 ">
                    <section className="font-bold text-xl md:text-3xl text-white ">My Streams</section>
                    <section className="text-sm md:text-md text-gray-400">Manage streams you host and participate in </section>
                </section>
                <section className="">
                    <Button className="flex items-center  bg-white text-black rounded-md gap-2 px-1 py-2 text-sm md:text-md" callback={() => alert("hello")}><Play />Create</Button>
                </section>
            </section>

            {/* Search bar for user */}
            <section className="w-full flex justify-center items-center  mt-10  pt-10 pb-4 ">
                <section className="w-full flex justify-center items-center">
                    <Search className="relative  border-l border-t border-b h-[40px] rounded-l-md text-gray-400" />
                    <input type="text" placeholder={`Search your streams ....`}
                        className="w-[70%] h-[40px]  pr-4 pl-2 py-2 rounded-r-md text-gray-100 flex justify-start  items-center gap-2 border-r border-t border-b border-l-none " />
                </section>
            </section>

            {/* user tabs */}
            <section className="w-full flex items-center justify-center my-5">
                <section className="flex w-[70%] bg-neutral-800 text-white justify-between items-center px-2 py-1 gap-5 rounded-md  ">

                    <button name="Hosted" className={` w-[50%] px-4 rounded-md flex justify-center items-center py-1 gap-2 text-white bg-${activeTab === "Hosted" ? "black" : "bg-gray-500"}`} onClick={() => setActivetab("Hosted")}><Crown /> Hosted</button>

                    <button name="Joined" className={` w-[50%] px-4 rounded-md flex justify-center items-center py-1 gap-2 text-white bg-${activeTab === "Joined" ? "black" : "bg-gray-500"}`} onClick={() => setActivetab("Joined")}> <UserCheck /> Joined</button>
                </section>

            </section>

            {/* tabs info show */}
            <section className="w-full flex justify-center items-center">
                <div className="w-[70%] grid grid-cols-1 md:grid-cols-2 gap-6">
                    {
                        allStreams.spaces.map(space => (
                            <div key={space.id as string} className="bg-neutral-900 rounded-lg p-4 flex flex-col gap-4 shadow-md">
                                <section className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-white">
                                        <CrownIcon className="text-yellow-400" />
                                        {space.name}
                                    </span>
                                    <span className="flex gap-2 items-center text-black bg-white rounded-lg px-1 ">
                                        <section>{space.isActive ? "live" : "paused"}</section>
                                    </span>
                                </section>


                                <section className="flex flex-col  w-full bg-neutral-700 rounded-md p-2 items-start gap-2 text-white">
                                    <section className="flex justify-center items-center gap-2 ">
                                        {space.isActive ? <span className="h-1 w-1 rounded-full animate-ping bg-green-500" /> : <Pause className="h-3 w-3" />}
                                        <span className="text-sm">{space.isActive ? "NOW PLAYING" : "PAUSED"}</span>
                                    </section>

                                    {space.name}
                                </section>

                                <section className="grid grid-cols-2 grid-rows-2">
                                    <Users className="h-3 w-3 text-white" /> {space.joinees}
                                </section>
                            </div>
                        ))
                    }
                </div>
            </section>
        </div>
    </div>
}