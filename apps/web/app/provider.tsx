"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { UserProvider } from "@/Context/userContext";
export default function Provider({ children }: { children: ReactNode }) {
  // Create QueryClient only once
  //   const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <UserProvider>{children}</UserProvider>
    </SessionProvider>
  );
}
