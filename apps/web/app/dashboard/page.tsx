'use client'
import {  MenuIcon, Music,PlaySquareIcon,Plus } from "lucide-react";
import { useState } from "react";
import { UserStatus , Spaces} from "../../utils/types";
export default function page() {

    const [userStatus, setUserStatus] = useState<UserStatus>({
        "total Streams Done": 120,
        "total Participants": 340,
        "total Streams Attended": 89
    });

    const [history,sethistory]=useState<Spaces[]>([
        {
            id: "1",
            name: "Morning Vibes",
            streams: [],
            hostId: "u1",
            hostName: "Alice",
            isActive: false
        },
        {
            id: "2",
            name: "Chill Beats",
            streams: [],
            hostId: "u2",
            hostName: "Bob",
            isActive: false
        }
    ]);
    return <div className="bg-black text-white w-screen h-full md:h-screen flex flex-col gap-10 p-10 overflow-hidden">
        <nav className="flex justify-between items-center border-b border-gray-700 pb-4 static">
            <section className="cursor-pointer "><MenuIcon /></section>
            <section className="flex gap-x-1 "><Music /> StreamSync</section>
            <button className=" w-fit text-sm md:text-md flex items-center cursor-pointer  bg-white rounded-md px-1 py-1 md:px-4  text-black"><Plus className="h-4 w-4 mr-2" />Create </button>
        </nav>
        {/*user stats*/}
        <div className="flex flex-col justify-between items-between">
            <section className="text-left">
                <section className="text-2xl font-semibold ">Welcome back to StreamSync</section>
                <section className="text-gray-400">Manage your music streams and create collaborative playlists</section>
            </section>
            <section className="grid grid-cols-1 grid-rows-3 md:grid-cols-3 md:grid-rows-1 gap-4 my-4">
                {(Object.keys(userStatus) as (keyof UserStatus)[]).map((key) => (
                    <section key={key} className=" w-fit-content flex flex-col text-gray-200 md:h-20 md:w-fit-content gap-4 justify-center items-center border border-gray-700 rounded-lg p-4">
                        <span className="text-shadow-md">{key}</span>
                        <span className="text-gray-400">{userStatus[key]}</span>
                    </section>
                ))}
            </section>
        </div>

        {/*previous streams*/}
        <div className="flex flex-col gap-5 items-start w-full justify-between rounded-md py-2 px-2 ">
            <section className="flex flex-col gap-2 w-full">
                <span className="text-xl md:text-2xl ">Previous Streams</span>
                <span className="text-gray-400 ">Your recently completed streaming sessions</span>
                <button className="bg-gray-400 rounded-md px-2 py-3 w-full">View All</button>
            </section>
            <section className="flex flex-col gap-5 w-full rounded-lg p-5">
                {
                    history.map((space,index) =>(
                        <div key={index} className="flex justify-start items-center text-left border border-gray-700 rounded-md p-3">
                            <section><PlaySquareIcon/></section>
                            <section className=" mx-3  flex flex-col items-start text-left justify-center gap-2 ">
                                <span className="font-semibold">{space.name}</span>
                            <span className="text-gray-400">{space.hostName}</span>
                            <span className="text-gray-400">{"status: "+(space.isActive ? "Active" : "Inactive")}</span>
                            </section>
                            
                        </div>
                    ))
                }
            </section>

        </div>

    </div>
}