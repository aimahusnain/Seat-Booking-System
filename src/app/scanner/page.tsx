"use client"

import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"

export default function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [qrDetected, setQrDetected] = useState(false)
  const [lastDetectedCode, setLastDetectedCode] = useState("")
  const [processing, setProcessing] = useState(false)
  const [scanResult, setScanResult] = useState<null | {
    success: boolean
    message: string
    details?: {
      name: string
      table: string
      seat: string
    }
  }>(null)
  const { status } = useSession()
  const router = useRouter()
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      const params = new URLSearchParams()
      params.set("redirectPath", "/scanner")
      router.push(`/login?${params.toString()}`)
    }
  }, [status, router])

  // Set theme color for browser chrome
  useEffect(() => {
    // Set meta tag for theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", "#000000")
    } else {
      const meta = document.createElement("meta")
      meta.name = "theme-color"
      meta.content = "#000000"
      document.head.appendChild(meta)
    }

    // Clean up
    return () => {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#fafafa") // Reset to default
      }
    }
  }, [])

  // Initialize scanner
  useEffect(() => {
    if (status === "authenticated" && !html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("reader")
      startScanner()
    }

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch((error) => console.error("Error stopping scanner:", error))
      }
    }
  }, [status])

  // Adjust scanner size to fill screen
  useEffect(() => {
    const adjustScannerSize = () => {
      if (scannerContainerRef.current) {
        const viewportHeight = window.innerHeight
        scannerContainerRef.current.style.height = `${viewportHeight}px`
      }
    }

    adjustScannerSize()
    window.addEventListener("resize", adjustScannerSize)

    return () => {
      window.removeEventListener("resize", adjustScannerSize)
    }
  }, [])

  const startScanner = async () => {
    if (!html5QrCodeRef.current) return

    setScanning(true)
    setScanResult(null)
    setQrDetected(false)
    setLastDetectedCode("")

    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Just detect the QR code but don't process it yet
          setQrDetected(true)
          setLastDetectedCode(decodedText)
        },
        (errorMessage) => {
          // QR code not in view
          if (errorMessage.includes("No QR code found")) {
            setQrDetected(false)
            setLastDetectedCode("")
          }
        },
      )
    } catch (err) {
      console.error("Error starting scanner:", err)
      toast.error("Could not access camera. Please check permissions.")
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop()
        setScanning(false)
      } catch (err) {
        console.error("Error stopping scanner:", err)
      }
    }
  }

  const processQrCode = async () => {
    if (!lastDetectedCode || processing) return

    try {
      setProcessing(true)

      // Parse the QR code URL to extract parameters
      const url = new URL(lastDetectedCode)
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

  const resetScanner = () => {
    setScanResult(null)
    setQrDetected(false)
    setLastDetectedCode("")
    startScanner()
  }

  // If not authenticated yet, show loading
  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-8">
            <h1 className="text-2xl font-bold mb-4 text-white">Loading...</h1>
            <p className="text-zinc-400">Please wait while we prepare the scanner...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div ref={scannerContainerRef} className="relative w-full bg-black overflow-hidden" style={{ height: "100vh" }}>
        {/* Camera View */}
        <div id="reader" className="w-full h-full"></div>

        {/* QR Frame Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-64 h-64 border-2 rounded-lg ${qrDetected ? "border-green-500" : "border-white/50"}`}>
            {qrDetected && (
              <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-green-500 rounded-full p-1">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Result Overlay */}
        {scanResult && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-6 shadow-xl">
              <div
                className={`p-6 ${scanResult.success ? "bg-green-900/20" : "bg-red-900/20"} rounded-xl text-center space-y-3 mb-4`}
              >
                <div
                  className={`h-16 w-16 ${scanResult.success ? "bg-green-800/30" : "bg-red-800/30"} rounded-full flex items-center justify-center mx-auto`}
                >
                  {scanResult.success ? (
                    <Check className="h-8 w-8 text-green-400" />
                  ) : (
                    <X className="h-8 w-8 text-red-400" />
                  )}
                </div>
                <h3 className={`text-lg font-semibold ${scanResult.success ? "text-green-400" : "text-red-400"}`}>
                  {scanResult.success ? "Check-in Successful" : "Check-in Failed"}
                </h3>
                <p className={`text-sm ${scanResult.success ? "text-green-500" : "text-red-500"}`}>
                  {scanResult.message}
                </p>
              </div>

              {scanResult.success && scanResult.details && (
                <div className="mt-4 p-4 bg-lime-900/20 rounded-xl mb-4">
                  <p className="font-medium text-white">{scanResult.details.name}</p>
                  <p className="text-sm text-zinc-400">
                    Table: {scanResult.details.table} | Seat: {scanResult.details.seat}
                  </p>
                </div>
              )}

              <Button onClick={resetScanner} className="w-full bg-lime-600 hover:bg-lime-700 text-white">
                Scan Another Code
              </Button>
            </div>
          </div>
        )}

        {/* Processing Overlay */}
        {processing && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-lime-500 animate-spin mx-auto mb-4" />
              <p className="text-white text-lg font-medium">Processing check-in...</p>
              <p className="text-zinc-400 text-sm mt-2">Please wait a moment</p>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center">
          <Button
            onClick={processQrCode}
            disabled={!qrDetected || processing}
            className={`h-16 w-16 rounded-full ${
              qrDetected && !processing ? "bg-lime-600 hover:bg-lime-700 text-white" : "bg-zinc-800 text-zinc-500"
            }`}
          >
            {processing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <div className="h-10 w-10 rounded-full border-2 border-current"></div>
            )}
          </Button>
        </div>

        {/* Close Button */}
        <Button
          onClick={() => router.push("/seat-scanning")}
          variant="ghost"
          className="absolute top-4 left-4 h-10 w-10 rounded-full bg-black/50 p-0 text-white"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </>
  )
}

