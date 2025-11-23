"use client";

import {
  ChevronLeft,
  ChevronRight,
  Crown,
  HomeIcon,
  Music,
  Plus,
  Sidebar,
  Sun,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "../app/globals.css";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";
const sidebar=React.memo(function SideBar() {
  const router = useRouter();
  const currentTab=useRef<string>(null);
  const [selectedTab, setSelectedTab] = useState<string|null>(null);
  const [open, setOpen] = useState(false);

  const handleTabClick = (tab: string, route: string) => {
    setSelectedTab(tab);
    currentTab.current=tab;
    router.replace(`/${route}`);
  };
  console.log(currentTab.current);
  console.log(selectedTab);
  const tabs = [
    { id: "home", label: "Home", icon: <HomeIcon />, route: "dashboard" },
    { id: "myStreams", label: "Crown", icon: <Crown />, route: "my-streams" },
    { id: "create", label: "Create", icon: <Plus />, route: "create-stream" },
    { id: "music", label: "Music", icon: <Music />, route: "join" },
  ];
  useEffect(() => {
    const tab=currentTab.current;
    if(tab!=null){
      setSelectedTab(tab);
    }
}
  , []);
  return (
    <motion.div
      initial={{ width: 60 }}
      animate={{ width: open ? 200 : 60 }}
      transition={{ duration: 0.3 }}
      className={`h-screen flex flex-col justify-between bg-zinc-900 text-white`}
    >
      {/* Toggle button */}
      <button
        className="py-5 pt-10 flex justify-center w-full"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronLeft /> : <ChevronRight />}
      </button>

      {/* Navigation buttons */}
      <div className="flex flex-col gap-3 items-center">
        {tabs.map((tab) => {
          const active = tab.id === selectedTab;

          return (
            <button
            key={tab.id}
              id={tab.id}
              onClick={() => handleTabClick(tab.id, tab.route)}
              className={`
                flex items-center gap-3 py-2 mx-4 rounded-lg w-full justify-center
                transition-all
                ${open ? "px-6" : ""}
                ${active ? "bg-blue-500" : open ? "bg-blue-600" : ""}
              `}
            >
              {tab.icon}
              {open && tab.label}
            </button>
          );
        })}
      </div>
      

      {/* Footer (Theme button) */}
      <button className="flex justify-center items-center gap-2 py-3 w-full">
        <Sun />
        {open && <span>Theme</span>}
      </button>
    </motion.div>
  );
});


type sidebarprops = {
  mobopen: boolean;
  setmopen: (value: boolean) => void;
};

function Mobile_sidebar({ mobopen, setmopen }: sidebarprops) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("home");

  useEffect(() => {
    document.body.style.overflow = mobopen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobopen]);

  const handleTabClick = (tab: string, route: string) => {
    setSelectedTab(tab);
    router.replace(`/${route}`);
    setmopen(false);
  };

  const tabs = [
    { id: "home", label: "Home", icon: <HomeIcon />, route: "dashboard" },
    { id: "myStreams", label: "Crown", icon: <Crown />, route: "my-streams" },
    { id: "create", label: "Create", icon: <Plus />, route: "create-stream" },
    { id: "music", label: "Music", icon: <Music />, route: "join" },
  ];

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: mobopen ? 220 : 0, opacity: mobopen ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className={`
        fixed top-0 left-0 bottom-0 bg-neutral-900 text-white z-50
        flex flex-col items-center
        ${mobopen ? "pointer-events-auto" : "pointer-events-none"}
      `}
      style={{ boxShadow: mobopen ? "2px 0 8px rgba(0,0,0,0.2)" : "none" }}
    >
      {/* Close Button */}
      <button
        className="w-full py-5 pt-10 border-b border-gray-700 flex justify-center"
        onClick={() => setmopen(false)}
      >
        <ChevronLeft />
      </button>

      {/* Navigation */}
      <div className="flex flex-col gap-4 mt-6 w-full items-center border-b border-gray-700 pb-6">
        {tabs.map((tab) => {
          const active = tab.id === selectedTab;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.route)}
              className={`
                w-[70%] px-8 py-2 rounded-lg text-sm flex justify-center items-center gap-3
                ${active ? "bg-blue-500" : "bg-blue-600"}
              `}
            >
              {tab.icon} {tab.label}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <button className="py-3 flex justify-center items-center w-full gap-2">
        <Sun />
        {mobopen && <span>Theme</span>}
      </button>
    </motion.div>
  );
}

export default sidebar;
export { Mobile_sidebar };