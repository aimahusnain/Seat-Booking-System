"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

const CheckInPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { status } = useSession()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      const params = new URLSearchParams(searchParams)
      params.set("redirectPath", "/check-in") // Ensure redirectPath is passed
      router.push(`/login?${params.toString()}`)
      return
    }

    // Only proceed with check-in if user is authenticated
    if (status === "authenticated") {
      const updateSeatStatus = async () => {
        try {
          const seatId = searchParams.get("seatId")

          if (!seatId) {
            toast.error("Invalid QR code")
            // Close window after showing error
            setTimeout(() => {
              window.close()
              // Fallback if window.close() doesn't work (common in mobile browsers)
              router.push("/seat-scanning")
            }, 600)
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
            // Close window after showing success
            setTimeout(() => {
              window.close()
              // Fallback if window.close() doesn't work (common in mobile browsers)
              router.push("/seat-scanning")
            }, 600)
          } else {
            toast.error("Check-in failed")
            // Close window after showing error
            setTimeout(() => {
              window.close()
              // Fallback if window.close() doesn't work (common in mobile browsers)
              router.push("/seat-scanning")
            }, 600)
          }
        } catch (error) {
          console.error("Error during check-in:", error)
          toast.error("Check-in failed")
          // Close window after showing error
          setTimeout(() => {
            window.close()
            // Fallback if window.close() doesn't work (common in mobile browsers)
            router.push("/seat-scanning")
          }, 600)
        } finally {
          setIsProcessing(false)
        }
      }

      updateSeatStatus()
    }
  }, [router, searchParams, status])

  return (
    <div>
      <h1>Checking you in...</h1>
      {isProcessing && <p>Processing...</p>}
    </div>
  )
}

export default CheckInPage

