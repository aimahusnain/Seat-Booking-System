"use client"

import { useState, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, QrCode, RefreshCw } from "lucide-react"

export default function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<null | {
    success: boolean
    message: string
    details?: {
      name: string
      table: string
      seat: string
    }
  }>(null)
  const [processing, setProcessing] = useState(false)
  const { status } = useSession()
  const router = useRouter()
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null)

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      const params = new URLSearchParams()
      params.set("redirectPath", "/scanner")
      router.push(`/login?${params.toString()}`)
    }
  }, [status, router])

  // Initialize scanner
  useEffect(() => {
    if (status === "authenticated" && !html5QrCode) {
      const newScanner = new Html5Qrcode("reader")
      setHtml5QrCode(newScanner)
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((error) => console.error("Error stopping scanner:", error))
      }
    }
  }, [status, html5QrCode])

  const startScanner = async () => {
    if (!html5QrCode) return

    setScanning(true)
    setScanResult(null)

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanFailure,
      )
    } catch (err) {
      console.error("Error starting scanner:", err)
      toast.error("Could not access camera. Please check permissions.")
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (html5QrCode && html5QrCode.isScanning) {
      try {
        await html5QrCode.stop()
        setScanning(false)
      } catch (err) {
        console.error("Error stopping scanner:", err)
      }
    }
  }

  const onScanSuccess = async (decodedText: string) => {
    if (processing) return // Prevent multiple scans while processing

    try {
      setProcessing(true)
      await stopScanner() // Stop the scanner while processing

      // Parse the QR code URL to extract parameters
      const url = new URL(decodedText)
      const seatId = url.searchParams.get("seatId")
      const name = url.searchParams.get("name")
      const table = url.searchParams.get("table")
      const seat = url.searchParams.get("seat")

      if (!seatId) {
        setScanResult({
          success: false,
          message: "Invalid QR code: Missing seat information",
        })
        toast.error("Invalid QR code")
        return
      }

      // Call the API to update seat status
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
        setScanResult({
          success: true,
          message: "Check-in successful!",
          details: {
            name: name || "Guest",
            table: table || "Unknown",
            seat: seat || "Unknown",
          },
        })
        toast.success("Check-in successful!")
      } else {
        setScanResult({
          success: false,
          message: data.message || "Check-in failed",
        })
        toast.error("Check-in failed")
      }
    } catch (error) {
      console.error("Error processing scan:", error)
      setScanResult({
        success: false,
        message: "Error processing scan",
      })
      toast.error("Error processing scan")
    } finally {
      setProcessing(false)
    }
  }

  const onScanFailure = (error: string) => {
    // Don't show errors for normal scanning failures
    console.log("Scan error:", error)
  }

  const resetScanner = () => {
    setScanResult(null)
    startScanner()
  }

  // If not authenticated yet, show loading
  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-lime-500/10">
            <h1 className="text-2xl font-bold mb-4 text-zinc-800 dark:text-zinc-200">Loading...</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Please wait while we prepare the scanner...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        <Card className="border-0 shadow-2xl shadow-lime-500/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
              <QrCode className="h-5 w-5 text-lime-600" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scanResult ? (
              <div className="space-y-4">
                <div
                  className={`p-6 ${scanResult.success ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"} rounded-xl text-center space-y-3`}
                >
                  <div
                    className={`h-16 w-16 ${scanResult.success ? "bg-green-100 dark:bg-green-800/30" : "bg-red-100 dark:bg-red-800/30"} rounded-full flex items-center justify-center mx-auto`}
                  >
                    {scanResult.success ? (
                      <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                    ) : (
                      <RefreshCw className="h-8 w-8 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <h3
                    className={`text-lg font-semibold ${scanResult.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                  >
                    {scanResult.success ? "Check-in Successful" : "Check-in Failed"}
                  </h3>
                  <p
                    className={`text-sm ${scanResult.success ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}
                  >
                    {scanResult.message}
                  </p>
                </div>

                {scanResult.success && scanResult.details && (
                  <div className="mt-4 p-4 bg-lime-50 dark:bg-lime-900/20 rounded-xl">
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">{scanResult.details.name}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Table: {scanResult.details.table} | Seat: {scanResult.details.seat}
                    </p>
                  </div>
                )}

                <Button onClick={resetScanner} className="w-full bg-lime-600 hover:bg-lime-700 text-white">
                  Scan Another Code
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div id="reader" className="w-full h-64 overflow-hidden rounded-xl"></div>

                {!scanning ? (
                  <Button onClick={startScanner} className="w-full bg-lime-600 hover:bg-lime-700 text-white">
                    Start Scanner
                  </Button>
                ) : (
                  <Button onClick={stopScanner} variant="outline" className="w-full">
                    Stop Scanner
                  </Button>
                )}

                <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                  Position the QR code within the frame to scan
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

