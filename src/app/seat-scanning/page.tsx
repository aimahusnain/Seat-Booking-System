"use client"

import { useEffect, useState, useMemo } from "react"
import { QrCode, Search, Sparkles, Check } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

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
  } | null>(null)

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

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setSearchValue(`${user.firstname} ${user.lastname}`)

    if (user.seat && user.seat.length > 0) {
      const seat = user.seat[0] // Get first seat assignment
      setSearchResult({
        table: seat.table.name,
        seat: seat.seat,
        name: `${user.firstname} ${user.lastname}`,
      })
      toast.success("Seat found!")
    } else {
      setSearchResult(null)
      toast.error("No seat booking found for this guest")
    }
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
              className="sm:flex hidden h-12 w-12 rounded-xl bg-white dark:bg-zinc-900 hover:bg-purple-50 dark:hover:bg-zinc-800 border-0 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300"
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
                        className="pl-9 h-12 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500/20 transition-all rounded-xl"
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
                                    "hover:bg-purple-50 dark:hover:bg-purple-900/20",
                                    "transition-colors duration-150",
                                    selectedUser?.id === user.id && "bg-purple-50 dark:bg-purple-900/20",
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
            "flex flex-col p-0 bg-white dark:bg-zinc-900 backdrop-blur-xl",
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