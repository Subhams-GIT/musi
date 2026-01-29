// global store for storing user information
// 1. all the spaces
// 2. user status
// 3.
import { create } from "zustand";
import {  Spaces } from "@/utils/types";
import { UserStatus } from "@/utils/types";

interface user {
  spaces: Spaces[],
  totals: UserStatus,
  setspaces: (spaces: any) => void,
  setStatus: (status:any) => void,
}

export const useSpaces = create<user>((set) => ({
  spaces: [],
  totals: { "total Participants": 0, "total Streams Attended": 0, "total Streams Done": 0 },
  setspaces: (spaces: any) => {
    set(() => ({ spaces:spaces}))
  },
  setStatus: (status:any) => set(() => ({totals:status}))
}));
