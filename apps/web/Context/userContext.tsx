"use client";

import { LoaderCircleIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
  image: string;
  id: string;
};

const UserContext = createContext<User | null | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { status, data } = useSession();
  
  useEffect(() => {
    if (status === "authenticated" && data?.user) {
      setUser(data.user as User);
    } else if (status === "unauthenticated") {
      setUser(null);
      if (pathname && pathname !== "/") {
        router.push("/");
      }
    }
  }, [status, data, pathname, router]);
  
  
  if (status === "loading" && pathname !== "/") {
     return (
       <div className="flex items-center justify-center min-h-screen bg-white">
         <div><LoaderCircleIcon className="animate-spin h-5 w-5 "/></div>
       </div>
    );
   }
  
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};


export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};


export { UserContext };
