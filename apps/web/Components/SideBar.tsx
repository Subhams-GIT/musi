'use client'
import { ChevronLeft, ChevronRight, Crown, HomeIcon, Music, Plus, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import '../app/globals.css'
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type sidebarprops = {
    mobopen: boolean,
    setmopen: (value: boolean) => void
}

export default function SideBar() {
    const [selectedTab, setSelectedTab] = useState<string>('home');

    const handleTabClick = (tab: string, route: string) => {
        setSelectedTab(tab);
        router.replace(`/${route}`)
    };
    const [open, setopen] = useState(false);
    const router = useRouter();

    // useEffect(() => {
    //     const arr = document.getElementsByTagName('button');
    //     for (let i = 0; i < arr.length; i++) {
    //       if(arr[i]!==undefined) arr[i].style.backgroundColor = '';
    //     }
    //     const element = document.getElementById(selectedTab);
    //     if (element) element.style.backgroundColor = 'blue';
    // }, [selectedTab]);

    return (
        <motion.div
            initial={{ width: 50 }}
            animate={{ width: open ? 200 : 60 }}
            transition={{ duration: 0.3, type: "keyframes" }}
            className={`h-screen relative flex flex-col items-center justify-between gap-10 bg-zinc-900 text-white min-h-full ${open ? "z-50" : "z-30"} transition-all`}
        >
            <button
                className="max-h-fit py-5 pt-10 px-5 flex  justify-center items-center border-gray-400 w-full "
                onClick={() => setopen(!open)}
            >
                {open ? <ChevronLeft className="text-right" /> : <ChevronRight />}
            </button>
            <div className={` h-[70vh] w-full flex flex-col justify-center items-center gap-y-5 text-md transition-all duration-300`}>
                <button
                    id="home"
                    onClick={() => handleTabClick('home', 'dashboard')}
                    className={` ${open ? "w-[70%] px-8" : ""} ${selectedTab === 'home' ? 'bg-blue-500' : ''} flex justify-center items-center ${open ? "bg-blue-600" : ""} gap-x-3 rounded-lg  py-2 mx-8 text-sm`}>
                    <HomeIcon /> {open ? "Home" : ""}
                </button>
                <button id="myStreams"
                    className={` text-white flex justify-center items-center ${open ? "w-[70%] px-8" : ""} ${selectedTab === 'myStreams' ? 'bg-blue-500' : ''} ${open ? "bg-blue-600" : ""} gap-3 rounded-lg py-2 mx-8 text-sm`}
                    onClick={() => handleTabClick('myStreams', 'my-streams')}
                >
                    <Crown /> {open ? "Crown" : ""}
                </button>
                <button id="create" className={`flex justify-center items-center  ${open ? "w-[70%] px-8" : ""} ${selectedTab === 'create' ? 'bg-blue-500' : ''} ${open ? "bg-blue-600" : ""} gap-3 rounded-lg  py-2 mx-8 text-sm`}
                    onClick={() => handleTabClick('create', 'create-stream')}>
                    <Plus /> {open ? "Plus" : ""}
                </button>
                <button id="music" className={`flex justify-center items-center ${open ? "w-[70%] px-8" : ""} ${open ? "bg-blue-600" : ""} gap-3 rounded-lg  py-2 mx-8 text-sm`}
                    onClick={() => handleTabClick('music', 'active-streams')}
                >
                    <Music /> {open ? "Music" : ""}
                </button>

            </div>
            <button className="h-full w-full text-center flex justify-center items-end gap-x-2 py-2">
                <Sun /> <span className="text-sm">{open ? "Theme" : ""}</span>
            </button>
        </motion.div>
    );
}

export function Mobile_sidebar({ mobopen, setmopen }: sidebarprops) {
     const [selectedTab, setSelectedTab] = useState<string>('home');

    const handleTabClick = (tab: string, route: string) => {
        setSelectedTab(tab);
        router.replace(route);
    };
    const router = useRouter();
    useEffect(() => {
        if (mobopen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobopen]);

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: mobopen ? 220 : 0, opacity: mobopen ? 1 : 0 }}
            transition={{ duration: 0.3, type: "keyframes" }}
            className={` fixed top-0 left-0 bottom-0 flex flex-col items-center justify-start gap-10 bg-neutral-900 text-white min-h-full z-50 transition-all ${mobopen ? "pointer-events-auto" : "pointer-events-none"}`}
            style={{ boxShadow: mobopen ? "2px 0 8px rgba(0,0,0,0.2)" : "none" }}
        >
            <button
                className="max-h-fit py-5 pt-10 px-5 flex justify-center items-center border-gray-400 w-full border-b-gray-600 border-b-1"
                onClick={() => setmopen(false)}
            >
                <ChevronLeft className="text-right" />
            </button>
            <div className="h-[70vh] w-full flex flex-col justify-start items-center gap-y-5 text-md border-b-gray-600 border-b-1 transition-all duration-300">
                <button onClick={() => router.replace('/dashboard')}
                    className={`w-[70%] px-8 flex justify-center items-center bg-blue-600 gap-x-3 rounded-lg py-2 mx-8 text-sm`}>
                    <HomeIcon /> Home
                </button>
                <button
                    className={`text-white flex justify-center items-center w-[70%] px-8 bg-blue-600 gap-3 rounded-lg py-2 mx-8 text-sm`}
                    onClick={() => router.replace('/my-streams')}
                >
                    <Crown /> Crown
                </button>
                <button
                    onClick={() => router.replace('/create-stream')}
                    className={`flex justify-center items-center w-[70%] px-8 bg-blue-600 gap-3 rounded-lg py-2 mx-8 text-sm`}>
                    <Plus /> create
                </button>
                <button className={`flex justify-center items-center w-[70%] px-8 bg-blue-600 gap-3 rounded-lg py-2 mx-8 text-sm`}
                 onClick={()=>handleTabClick('music','active-streams')}
                >
                    <Music /> Music
                </button>
            </div>
            <button className="h-10 w-full text-center flex justify-center items-center gap-x-2 py-2 border-t border-gray-700">
                <Sun /> <span className="text-sm">{mobopen ? "Theme" : ""}</span>
            </button>
        </motion.div>
    );
}