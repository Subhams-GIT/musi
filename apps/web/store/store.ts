// global store for storing user information
// 1. all the spaces
// 2. user status
// 3.
import { create } from "zustand";
import { History } from "@/utils/types";
import axios from "axios";
import { UserStatus } from "@/utils/types";
interface user{
  spaces:History[],
  totals:UserStatus,
  setspaces:()=>void,
  setStatus:()=>void,
}
async function getuserstatus():Promise<History[]|null>{
  const res=await axios.get(`${window.location.protocol}//${window.location.hostname}:3000/api/spaces`);
  return res.data.returnspaces;
}
const useSpaces = create((set) => ({
  spaces:[],
  insights:{},
  setspaces: () => set((state:History) => ({ spaces: [...state,getuserstatus()] })),
  setStatus:()=>set((state:UserStatus)=>({}))
  }));
