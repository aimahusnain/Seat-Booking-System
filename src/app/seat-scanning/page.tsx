"use client"

import { useState } from "react"
import { QrCode, Search, Sparkles } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function SeatScanning() {
  const [name, setName] = useState("")
  const [isQrOpen, setIsQrOpen] = useState(false)
  const [searchResult, setSearchResult] = useState<{
    table: string
    seat: number
    name: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Please enter a name")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/search-seat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await response.json()

      if (data.success && data.seat) {
        setSearchResult({
          table: data.seat.table.name,
          seat: data.seat.seat,
          name: name,
        })
        toast.success("Seat found!")
      } else {
        setSearchResult(null)
        toast.error("No seat booking found for this name")
      }
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Error searching for seat")
      setSearchResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950">
      {/* Decorative Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-30">
          <div className="absolute inset-0 blur-[120px] bg-gradient-to-r from-violet-400 to-purple-400" />
        </div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] opacity-30">
          <div className="absolute inset-0 blur-[120px] bg-gradient-to-r from-blue-400 to-cyan-400" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl shadow-purple-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Seat Scanner
              </h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsQrOpen(true)}
              className="h-12 w-12 rounded-xl bg-white dark:bg-zinc-900 hover:bg-purple-50 dark:hover:bg-zinc-800 border-0 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300"
            >
              <QrCode className="h-5 w-5 text-purple-600" />
            </Button>
          </motion.div>

          {/* Search Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-2xl shadow-purple-500/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-zinc-800 dark:text-zinc-200">Find Your Seat</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-zinc-600 dark:text-zinc-400">
                      Enter your name
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9 h-12 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500/20 transition-all rounded-xl"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className={cn(
                      "w-full h-12 rounded-xl text-base font-medium",
                      "bg-gradient-to-r from-violet-600 to-purple-600",
                      "hover:from-violet-700 hover:to-purple-700",
                      "shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40",
                      "transition-all duration-300",
                    )}
                    disabled={isLoading}
                  >
                    {isLoading ? "Searching..." : "Find Seat"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search Result */}
          <AnimatePresence mode="wait">
            {searchResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-2xl shadow-purple-500/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 pb-8">
                    <CardTitle className="text-white flex items-center gap-3">
                      <span className="bg-white/20 p-2 rounded-xl">
                        <QrCode className="h-5 w-5" />
                      </span>
                      Your Seat Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 rounded-xl bg-violet-50/50 dark:bg-violet-900/20">
                        <span className="text-sm font-medium text-violet-600 dark:text-violet-400">Name</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{searchResult.name}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/20">
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Table</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{searchResult.table}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-900/20">
                        <span className="text-sm font-medium text-fuchsia-600 dark:text-fuchsia-400">Seat Number</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{searchResult.seat}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* QR Code Dialog - Responsive */}
      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent
          className={cn(
            "flex flex-col p-0 bg-white dark:bg-zinc-900/80 backdrop-blur-xl",
            "w-[95vw] max-w-3xl rounded-2xl border-0",
            "sm:w-[85vw] md:w-[75vw] h-auto",
            "shadow-2xl shadow-purple-500/10",
          )}
        >
          <div className="relative w-full aspect-square sm:aspect-video md:aspect-[4/3] lg:aspect-[16/16]">
            <Image
              src="/qr-code-for-seat-booking.svg"
              alt="QR Code for Seat Booking"
              fill
              className="object-contain p-6 sm:p-8 md:p-10 lg:p-12"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

