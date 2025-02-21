"use client"

import type React from "react"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const SESSION_TIMEOUT = 60 * 5000 // 60 seconds

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const checkSession = () => {
      const lastCloseTime = localStorage.getItem("lastCloseTime")
      if (lastCloseTime) {
        const timeSinceClose = Date.now() - Number.parseInt(lastCloseTime)
        if (timeSinceClose >= SESSION_TIMEOUT) {
          localStorage.removeItem("lastCloseTime")
          signOut({ redirect: true, callbackUrl: "/login" })
        }
      }
    }

    // Check session when component mounts
    checkSession()

    // Check session when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSession()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [status, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return <>{children}</>
}

