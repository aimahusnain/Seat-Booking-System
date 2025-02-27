"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

export default function CheckIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const { status } = useSession()

  useEffect(() => {
      if (status === "unauthenticated") {
        const params = new URLSearchParams(searchParams);
        params.set("redirectPath", "/check-in"); // Ensure redirectPath is passed
        router.push(`/login?${params.toString()}`);
        return;
      }

    // Only proceed with check-in if user is authenticated
    if (status === "authenticated") {
      const updateSeatStatus = async () => {
        try {
          const seatId = searchParams.get("seatId")

          if (!seatId) {
            toast.error("Invalid QR code")
            setTimeout(() => router.push("/seat-scanning"), 2000)
            return
          }

          const response = await fetch("/api/update-seat-received", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              seatId: seatId,
              isReceived: true,
            }),
          })

          const data = await response.json()

          if (data.success) {
            toast.success("Check-in successful!")
            setTimeout(() => router.push("/seat-scanning"), 2000)
          } else {
            toast.error("Check-in failed")
            setTimeout(() => router.push("/seat-scanning"), 2000)
          }
        } catch (error) {
          console.error("Error during check-in:", error)
          toast.error("Check-in failed")
          setTimeout(() => router.push("/seat-scanning"), 2000)
        } finally {
          setIsProcessing(false)
        }
      }

      updateSeatStatus()
    }
  }, [router, searchParams, status])

  // Show loading state while checking authentication or processing
  if (status === "loading" || (status === "authenticated" && isProcessing)) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-lime-500/10">
            <h1 className="text-2xl font-bold mb-4 text-zinc-800 dark:text-zinc-200">Processing Check-in...</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Please wait while we confirm your seat...</p>

            {searchParams.get("name") && (
              <div className="mt-4 p-4 bg-lime-50 dark:bg-lime-900/20 rounded-xl">
                <p className="font-medium text-zinc-800 dark:text-zinc-200">{searchParams.get("name")}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Table: {searchParams.get("table")} | Seat: {searchParams.get("seat")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // This will only render if status is authenticated and processing is complete
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-lime-500/10">
          <h1 className="text-2xl font-bold mb-4 text-zinc-800 dark:text-zinc-200">Check-in Complete</h1>
          <p className="text-zinc-600 dark:text-zinc-400">You&apos;ll be redirected back to the main page.</p>

          {searchParams.get("name") && (
            <div className="mt-4 p-4 bg-lime-50 dark:bg-lime-900/20 rounded-xl">
              <p className="font-medium text-zinc-800 dark:text-zinc-200">{searchParams.get("name")}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Table: {searchParams.get("table")} | Seat: {searchParams.get("seat")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

