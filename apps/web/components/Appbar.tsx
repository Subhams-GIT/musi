"use client";

import {signIn, signOut, useSession} from "next-auth/react";

const Appbar = () => {
  const session = useSession();
  return (
    <div className="flex justify-between rounded-xl bg-white shadow-md ">
      {session.data?.user && (
        <button
          onClick={() => signOut()}
          className="text-white rounded-md bg-blue-600 px-2 py-1 h-full w-full cursor-pointer"
        >
          SignOut
        </button>
      )}
      {!session.data?.user && (
        <button
          onClick={() => signIn()}
          className="text-white rounded-md bg-blue-600 px-2 py-1 h-full w-full cursor-pointer"
        >
          SignIn
        </button>
      )}
    </div>
  );
};

export default Appbar;
