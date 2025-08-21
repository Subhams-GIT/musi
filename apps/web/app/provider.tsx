"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useState } from "react";

export default function Provider({ children }: { children: ReactNode }) {
  // Create QueryClient only once
//   const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
        {children}
    </SessionProvider>
  );
}
