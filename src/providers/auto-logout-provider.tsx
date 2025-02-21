"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useCallback } from "react"

interface AutoLogoutProviderProps {
  children: React.ReactNode
  timeoutMinutes?: number
}

export function AutoLogoutProvider({
  children,
  timeoutMinutes = 30, // Default timeout of 30 minutes
}: AutoLogoutProviderProps) {
  const { data: session } = useSession()

  const updateLastActivity = useCallback(() => {
    if (session) {
      localStorage.setItem("lastActivityTime", Date.now().toString())
    }
  }, [session])

  const checkInactivity = useCallback(() => {
    if (!session) return

    const lastActivityTime = localStorage.getItem("lastActivityTime")
    if (!lastActivityTime) {
      updateLastActivity()
      return
    }

    const inactiveTime = Date.now() - parseInt(lastActivityTime)
    const inactiveMinutes = inactiveTime / (1000 * 60)

    if (inactiveMinutes >= timeoutMinutes) {
      signOut({ redirect: true, callbackUrl: "/login" })
    }
  }, [session, timeoutMinutes, updateLastActivity])

  useEffect(() => {
    if (!session) return

    // Update last activity on initial load
    updateLastActivity()

    // Set up activity listeners
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ]

    activityEvents.forEach((event) => {
      window.addEventListener(event, updateLastActivity)
    })

    // Check for inactivity every minute
    const intervalId = setInterval(checkInactivity, 60 * 1000)

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateLastActivity)
      })
      clearInterval(intervalId)
    }
  }, [session, updateLastActivity, checkInactivity])

  return <>{children}</>
}
