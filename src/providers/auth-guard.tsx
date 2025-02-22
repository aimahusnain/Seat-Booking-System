// auth-guard.tsx
"use client"

import type React from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

const SESSION_TIMEOUT = 60 * 10000 // 60 seconds

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Check if current path is seat-scanning
  const isSeatScanningPage = pathname?.startsWith('/seat-scanning')

  useEffect(() => {
    // Skip authentication check for seat-scanning page
    if (isSeatScanningPage) {
      return
    }

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

    checkSession()

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSession()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [status, router, isSeatScanningPage])

  // Skip loading state for seat-scanning page
  if (isSeatScanningPage) {
    return <>{children}</>
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return <>{children}</>
}