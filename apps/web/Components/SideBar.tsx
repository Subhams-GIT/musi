'use client'
import { ChevronLeft, ChevronRight,Crown,HomeIcon, Music, Plus, Settings, Sun, Users } from "lucide-react";
import { useState } from "react";
import '../app/globals.css'
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
export default function SideBar() {
    const [open, setopen] = useState(false);
    const router=useRouter();
    return (
        <motion.div
            initial={{ width: 50 }}
            animate={{ width: open ? 200 : 60 }}
            transition={{ duration: 0.3, type: "keyframes" }}
            className={` relative flex flex-col items-center justify-start gap-10 bg-zinc-900 text-white min-h-full z-${open ? 50 : 3000} transition-all`}
        >
            <button
                className="max-h-fit py-5 pt-10 px-5 flex justify-center items-center border-gray-400 w-full border-b-gray-600 border-b-1"
                onClick={() => setopen(!open)}
            >
                {open ? <ChevronLeft className="text-right" /> : <ChevronRight />}
            </button>
            <div className="h-[70vh] w-full flex flex-col justify-start items-center gap-y-5 text-md border-b-gray-600 border-b-1 transition-all duration-300">
                <button className={` ${open ? "w-[70%] px-8" : ""} flex justify-center items-center ${open ? "bg-blue-600" : ""} gap-x-3 rounded-lg  py-2 mx-8 text-sm`}>
                    <HomeIcon /> {open ? "Home" : ""}
                </button>
                <button className={` text-white flex justify-center items-center ${open ? "w-[70%] px-8" : ""} ${open ? "bg-blue-600" : ""} gap-3 rounded-lg py-2 mx-8 text-sm`}
                onClick={()=>router.replace('/my-streams')}
                >
                    <Crown /> {open ? "Crown" : ""}
                </button>
                <button className={`flex justify-center items-center  ${open ? "w-[70%] px-8" : ""} ${open ? "bg-blue-600" : ""} gap-3 rounded-lg  py-2 mx-8 text-sm`}>
                    <Plus /> {open ? "Plus" : ""}
                </button>
                <button className={`flex justify-center items-center ${open ? "w-[70%] px-8" : ""} ${open ? "bg-blue-600" : ""} gap-3 rounded-lg  py-2 mx-8 text-sm`}>
                    <Music /> {open ? "Music" : ""}
                </button>
                <button className={`flex justify-center items-center ${open ? "w-[70%] px-8" : ""} ${open ? "bg-blue-600" : ""} gap-3 rounded-lg  py-2 mx-8 text-sm`}>
                    <Users /> {open ? "Users" : ""}
                </button>
                <button className={`flex justify-center items-center ${open ? "w-[70%] px-8" : ""} ${open ? "bg-blue-600" : ""} gap-3 rounded-lg  py-2 mx-8 text-sm`}>
                    <Settings /> {open ? "Settings" : ""}
                </button>
            </div>
            <button className="h-10 w-full text-center p-auto flex justify-center items-end">
                <Sun />
            </button>
        </motion.div>
    );
}