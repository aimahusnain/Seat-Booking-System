"use client";

import { SessionProvider, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleWindowClose = async () => {
      await signOut({ redirect: false });
    };

    window.addEventListener("beforeunload", handleWindowClose);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}