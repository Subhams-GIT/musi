import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { JSX } from "react";

export default function Auth({ children }: { children: JSX.Element }) {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return children;
}
