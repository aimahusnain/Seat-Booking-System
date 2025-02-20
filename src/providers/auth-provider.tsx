"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import { useEffect } from "react"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const handleTabClose = () => {
      localStorage.setItem("lastCloseTime", Date.now().toString())
    }

    window.addEventListener("beforeunload", handleTabClose)

    return () => {
      window.removeEventListener("beforeunload", handleTabClose)
    }
  }, [])

  return <SessionProvider>{children}</SessionProvider>
}

