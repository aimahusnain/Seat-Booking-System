"use client"

import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2, QrCode, ZoomIn, ZoomOut } from "lucide-react"

// Extend the MediaTrackConstraintSet type to include zoom
interface ExtendedMediaTrackConstraintSet extends MediaTrackConstraintSet {
  zoom?: number
}

// Extend the MediaTrackCapabilities type to include zoom
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  zoom?: {
    min: number
    max: number
    step: number
  }
}

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
  const lastDetectionRef = useRef<number>(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [zoomSupported, setZoomSupported] = useState(false)
  const [minZoom, setMinZoom] = useState(1)
  const [maxZoom, setMaxZoom] = useState(5)
  const [showZoomControls, setShowZoomControls] = useState(false)
console.log(scanning, zoomSupported)
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

  // Check for QR code timeout
  useEffect(() => {
    // If QR code is detected, update the last detection time
    if (qrDetected) {
      lastDetectionRef.current = Date.now()
    }

    // Set up an interval to check if QR code has been out of view for too long
    const interval = setInterval(() => {
      if (qrDetected && Date.now() - lastDetectionRef.current > 500) {
        // If it's been more than 500ms since last detection, consider QR code lost
        setQrDetected(false)
        setLastDetectedCode("")
      }
    }, 100)

    return () => clearInterval(interval)
  }, [qrDetected])

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

  // Hide the default QR scanner UI elements and set up zoom
  useEffect(() => {
    // Add custom CSS to hide the default QR scanner UI
    const style = document.createElement("style")
    style.textContent = `
      #reader__scan_region {
        display: none !important;
      }
      #reader__dashboard {
        display: none !important;
      }
      #reader {
        border: none !important;
        box-shadow: none !important;
      }
      #reader video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }
    `
    document.head.appendChild(style)

    // Find and reference the video element for zoom control
    const findVideoElement = () => {
      const video = document.querySelector("#reader video") as HTMLVideoElement
      if (video) {
        videoRef.current = video
        checkZoomSupport(video)
      } else {
        // If video element isn't available yet, try again in a moment
        setTimeout(findVideoElement, 500)
      }
    }

    findVideoElement()

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Check if zoom is supported and get zoom range
  const checkZoomSupport = async (videoElement: HTMLVideoElement) => {
    try {
      if (!videoElement.srcObject) return

      const track = (videoElement.srcObject as MediaStream).getVideoTracks()[0]

      if (!track) return

      const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities

      // Check if zoom is supported
      if (capabilities.zoom) {
        setZoomSupported(true)
        setMinZoom(capabilities.zoom.min || 1)
        setMaxZoom(capabilities.zoom.max || 5)
        setShowZoomControls(true)
      } else {
        setZoomSupported(false)
        setShowZoomControls(false)
      }
    } catch (error) {
      console.error("Error checking zoom support:", error)
      setZoomSupported(false)
      setShowZoomControls(false)
    }
  }

  // Apply zoom to the camera
  const applyZoom = async (zoomFactor: number) => {
    try {
      if (!videoRef.current || !videoRef.current.srcObject) return

      const track = (videoRef.current.srcObject as MediaStream).getVideoTracks()[0]

      if (!track) return

      const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities

      // Check if zoom is supported
      if (capabilities.zoom) {
        // Ensure zoom is within the allowed range
        const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomFactor))

        // Apply the zoom constraint
        const constraints: MediaTrackConstraints = {
          advanced: [{ zoom: newZoom } as ExtendedMediaTrackConstraintSet],
        }

        await track.applyConstraints(constraints)
        setZoomLevel(newZoom)
      }
    } catch (error) {
      console.error("Error applying zoom:", error)
    }
  }

  // Zoom in function
  const zoomIn = () => {
    const newZoom = Math.min(maxZoom, zoomLevel + 0.5)
    applyZoom(newZoom)
  }

  // Zoom out function
  const zoomOut = () => {
    const newZoom = Math.max(minZoom, zoomLevel - 0.5)
    applyZoom(newZoom)
  }

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
          fps: 15, // Increased FPS for more responsive detection
          qrbox: undefined, // Don't use the library's qrbox, we'll create our own UI
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Just detect the QR code but don't process it yet
          setQrDetected(true)
          setLastDetectedCode(decodedText)
          lastDetectionRef.current = Date.now() // Update last detection time
        },
        (errorMessage) => {
          console.log("Error scanning QR code:", errorMessage)
          // This callback is called frequently when no QR code is found
          // We don't need to do anything here as we have the timeout mechanism
        },
      )
    } catch (err) {
      console.error("Error starting scanner:", err)
      toast.error("Could not access camera. Please check permissions.")
      setScanning(false)
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

        {/* Custom QR Frame Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Single frame with corner markers */}
            <div
              className={`w-64 h-64 ${qrDetected ? "border-lime-500" : "border-white/70"} rounded-lg transition-colors duration-300`}
            >
              {/* Top-left corner */}
              <div
                className={`absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 ${qrDetected ? "border-lime-500" : "border-white"} rounded-tl-lg`}
              ></div>
              {/* Top-right corner */}
              <div
                className={`absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 ${qrDetected ? "border-lime-500" : "border-white"} rounded-tr-lg`}
              ></div>
              {/* Bottom-left corner */}
              <div
                className={`absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 ${qrDetected ? "border-lime-500" : "border-white"} rounded-bl-lg`}
              ></div>
              {/* Bottom-right corner */}
              <div
                className={`absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 ${qrDetected ? "border-lime-500" : "border-white"} rounded-br-lg`}
              ></div>
            </div>

            {/* Status indicator */}
            {qrDetected ? (
              <div className="absolute -top-4 -right-4 bg-lime-500 rounded-full p-1 shadow-lg">
                <Check className="h-5 w-5 text-white" />
              </div>
            ) : (
              <div className="absolute -top-4 -right-4 bg-zinc-700 rounded-full p-1 shadow-lg">
                <QrCode className="h-5 w-5 text-white/70" />
              </div>
            )}

            {/* Status text */}
            <div
              className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full ${
                qrDetected ? "bg-lime-500/90" : "bg-zinc-800/90"
              } transition-colors duration-300 text-white text-sm font-medium`}
            >
              {qrDetected ? "QR Code Detected" : "Searching for QR Code..."}
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        {showZoomControls && (
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              onClick={zoomIn}
              disabled={zoomLevel >= maxZoom}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50 p-0 text-white hover:bg-black/70"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>

            <div className="bg-black/50 text-white text-xs font-medium rounded-full px-2 py-1 text-center">
              {zoomLevel.toFixed(1)}x
            </div>

            <Button
              onClick={zoomOut}
              disabled={zoomLevel <= minZoom}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50 p-0 text-white hover:bg-black/70"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
          </div>
        )}

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
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <button
            onClick={processQrCode}
            disabled={!qrDetected || processing}
            className={`
              h-20 w-20 rounded-full flex items-center justify-center focus:outline-none
              ${
                qrDetected && !processing
                  ? "bg-gradient-to-r from-lime-500 to-green-500 shadow-lg shadow-lime-500/30"
                  : "bg-zinc-800 opacity-70"
              }
              transition-all duration-300 transform ${qrDetected ? "scale-105" : "scale-100"}
            `}
          >
            {processing ? (
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            ) : (
              <div
                className={`
                h-16 w-16 rounded-full border-4 
                ${qrDetected ? "border-white bg-lime-500/30" : "border-zinc-600 bg-zinc-900/50"}
                flex items-center justify-center
              `}
              >
                {qrDetected && <Check className="h-8 w-8 text-white" />}
              </div>
            )}
          </button>
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

