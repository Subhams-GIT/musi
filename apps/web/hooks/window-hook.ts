'use client'

import { useEffect, useState } from "react"

export default function useWindow(){
    const [windowsize,setwindowsize]=useState(()=>window.innerWidth);
    useEffect(()=>{
        const handleResize = () => {
            setwindowsize(window.innerWidth);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    },[windowsize])

    return windowsize;
}