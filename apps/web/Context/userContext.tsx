"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
  image: string;
  id: string;
};

const UserContext = createContext<User | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  // Use useEffect to update user state when session data changes
  useEffect(() => {
    if (status === "authenticated" && data?.user) {
      setUser(data.user as User);
    }
  }, [status, data]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

// Export a custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Export the context if needed elsewhere
export { UserContext };
