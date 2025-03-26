"use client"

import QRCodeGenerator from "@/components/qr-code-generator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Check, HelpCircle, QrCode, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

interface User {
  id: string
  firstname: string
  lastname: string
  seat: Array<{
    id: string
    seat: number
    table: {
      id: string
      name: string
    }
  }>
}

export default function SeatScanning() {
  const [isQrOpen, setIsQrOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchResult, setSearchResult] = useState<{
    table: string
    seat: number
    name: string
    seatId: string
  } | null>(null)
  const [seatIsReceived, setSeatIsReceived] = useState(false)
  const [noSeatFound, setNoSeatFound] = useState(false)

  // Fetch all guests when component mounts
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await fetch("/api/get-guests")
        const data = await response.json()

        if (data.success) {
          setAllUsers(data.data)
        } else {
          toast.error("Failed to load guest list")
        }
      } catch (error) {
        console.error("Error fetching guests:", error)
        toast.error("Failed to load guest list")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuests()
  }, [])

  // Filter users based on search input
  const filteredUsers = useMemo(() => {
    if (!searchValue) return []

    const searchTerm = searchValue.toLowerCase()
    return allUsers
      .filter(
        (user) =>
          user.firstname.toLowerCase().includes(searchTerm) ||
          user.lastname.toLowerCase().includes(searchTerm) ||
          `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchTerm),
      )
      .slice(0, 5) // Limit to 5 results
  }, [searchValue, allUsers])

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user)
    setSearchValue(`${user.firstname} ${user.lastname}`)
    setNoSeatFound(false)
    setSeatIsReceived(false)

    if (user.seat && user.seat.length > 0) {
      const seat = user.seat[0] // Get first seat assignment

      try {
        // Check if seat is already received
        const response = await fetch(`/api/get-seat-checkin?seatId=${seat.id}`)
        const data = await response.json()

        if (data.success) {
          setSeatIsReceived(data.data.isReceived)
        }
      } catch (error) {
        console.error("Error checking seat status:", error)
      }

      setSearchResult({
        table: seat.table.name,
        seat: seat.seat,
        name: `${user.firstname} ${user.lastname}`,
        seatId: seat.id,
      })
      toast.success(`Seat found!`)
    } else {
      setSearchResult(null)
      setNoSeatFound(true)
      toast.error("No seat booking found for this guest")
    }
  }

  // Generate QR code content
  const generateQrContent = () => {
    if (!searchResult) return ""

    // Create a URL with parameters that can be parsed when scanned
    const baseUrl = window.location.origin
    return `${baseUrl}/check-in?seatId=${
      searchResult.seatId
    }&name=${encodeURIComponent(searchResult.name)}&table=${encodeURIComponent(
      searchResult.table,
    )}&seat=${searchResult.seat}`
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950">
      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl shadow-lime-500/10"
          >
            {/* Logo */}
            <Link href="/" className="flex justify-center items-center space-x-2">
              <Image src="/logo.jpg" alt="Seating4U Logo" width={150} height={200} />
            </Link>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsQrOpen(true)}
                className="sm:flex hidden h-12 w-12 rounded-xl bg-white dark:bg-zinc-900 hover:bg-lime-50 dark:hover:bg-zinc-800 border-0 shadow-lg shadow-lime-500/10 hover:shadow-lime-500/20 transition-all duration-300"
              >
                <QrCode className="h-5 w-5 text-green-600" />
              </Button>
            </div>
          </motion.div>

          {/* Search Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-2xl shadow-lime-500/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-zinc-800 dark:text-zinc-200">Find Your Seat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-zinc-600 dark:text-zinc-400">
                      Search your name
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        id="name"
                        placeholder={isLoading ? "Loading guest list..." : "Start typing your name..."}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        disabled={isLoading}
                        className="pl-9 h-12 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-lime-500/20 transition-all rounded-xl"
                      />
                    </div>

                    {/* Search Results */}
                    {searchValue && !isLoading && (
                      <Card className="mt-2 border-0 shadow-lg">
                        <CardContent className="p-2">
                          {filteredUsers.length > 0 ? (
                            <div className="space-y-1">
                              {filteredUsers.map((user) => (
                                <button
                                  key={user.id}
                                  onClick={() => handleUserSelect(user)}
                                  className={cn(
                                    "w-full flex items-center px-4 py-2 rounded-lg text-left",
                                    "hover:bg-lime-50 dark:hover:bg-lime-900/20",
                                    "transition-colors duration-150",
                                    selectedUser?.id === user.id && "bg-lime-50 dark:bg-lime-900/20",
                                  )}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedUser?.id === user.id ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  <span className="flex-1">
                                    {user.firstname} {user.lastname}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-sm text-zinc-500">No matching names found</div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search Result or No Seat Message */}
          <AnimatePresence mode="wait">
            {searchResult ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-2xl shadow-lime-500/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl overflow-hidden">
                  <CardHeader className="bg-lime-500 pb-8">
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
                        <span className="text-sm font-medium text-lime-600 dark:text-violet-400">Name</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{searchResult.name}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-xl bg-lime-50/50 dark:bg-lime-900/20">
                        <span className="text-sm font-medium text-green-600 dark:text-lime-400">Table</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{searchResult.table}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-900/20">
                        <span className="text-sm font-medium text-fuchsia-600 dark:text-fuchsia-400">Seat Number</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{searchResult.seat}</span>
                      </div>

                      {seatIsReceived ? (
                        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center space-y-3">
                          <div className="h-16 w-16 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mx-auto">
                            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Already Arrived</h3>
                          <p className="text-sm text-green-600 dark:text-green-500">
                            You have already arrived for this event. Enjoy!
                          </p>
                        </div>
                      ) : (
                        <>
                          <QRCodeGenerator value={generateQrContent()} />
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : noSeatFound ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-2xl shadow-lime-500/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                        <HelpCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Seat Not Available</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Your seat hasn&apos;t been assigned yet. Please see someone at the front desk for assistance.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-4 bg-white dark:bg-zinc-900 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        onClick={() => setNoSeatFound(false)}
                      >
                        Search Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* QR Code Dialog - Responsive */}
      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent
          className={cn(
            "flex flex-col p-0 bg-white dark:bg-zinc-900 backdrop-blur-xl",
            "w-[95vw] max-w-sm h-[400px] rounded-2xl border-0",
            "sm:w-[85vw] md:w-[75vw] h-fit-content",
            "shadow-2xl shadow-lime-500/10",
          )}
        >
          <div className="relative w-full aspect-square sm:aspect-video md:aspect-[4/3] lg:aspect-[16/16]">
            <Image
              src="/qr-code-for-seating4u.svg"
              alt="QR Code for Seating4U"
              className="object-contain h-[400px] w-[400px] p-7"
              priority
              height={300}
              width={300}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

