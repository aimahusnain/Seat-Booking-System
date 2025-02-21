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
    const storeLastActive = () => {
      localStorage.setItem("lastActiveTime", Date.now().toString())
    }

    // Store initial active time
    storeLastActive()

    // Update last active time while the user is on the site
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"]
    activityEvents.forEach((event) => {
      window.addEventListener(event, storeLastActive)
    })

    const handleTabClose = () => {
      localStorage.setItem("lastCloseTime", Date.now().toString())
    }

    window.addEventListener("beforeunload", handleTabClose)

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, storeLastActive)
      })
      window.removeEventListener("beforeunload", handleTabClose)
    }
  }, [])

  return <SessionProvider>{children}</SessionProvider>
}

