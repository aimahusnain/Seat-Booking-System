"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus, Wand2, Table2 } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import type React from "react"

interface AddTableFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onTableAdded: () => void
}

export function AddTableForm({ isOpen, onClose, onSuccess, onTableAdded }: AddTableFormProps) {
  const [tableNumber, setTableNumber] = useState<number | null>(null)
  const [numberOfSeats, setNumberOfSeats] = useState(6)
  const [seatNumbers, setSeatNumbers] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchLastTableNumber()
    }
  }, [isOpen])

  const fetchLastTableNumber = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/get-last-table-number")
      const data = await response.json()
      setTableNumber(data.lastTableNumber + 1)
    } catch (error) {
      console.error("Failed to fetch last table number:", error)
      toast.error("Failed to fetch last table number")
    } finally {
      setIsLoading(false)
    }
  }

  const updateSeatNumbers = (count: number) => {
    setSeatNumbers(Array(count).fill(""))
  }

  const handleSeatsChange = (value: number[]) => {
    const newCount = value[0]
    setNumberOfSeats(newCount)
    updateSeatNumbers(newCount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tableNumber === null) {
      toast.error("Table number is not available")
      return
    }
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/add-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Table ${tableNumber}`,
          seats: seatNumbers.map((num) => Number.parseInt(num || "0")),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Table added successfully")
        onSuccess()
        onTableAdded()
        onClose()
        setNumberOfSeats(6)
        setSeatNumbers([])
      } else {
        throw new Error(data.message || "Failed to add table")
      }
    } catch (error) {
      toast.error("Failed to add table", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSeatNumberChange = (index: number, value: string) => {
    const newSeatNumbers = [...seatNumbers]
    newSeatNumbers[index] = value
    setSeatNumbers(newSeatNumbers)
  }

  const handleMagicFill = () => {
    if (tableNumber === null) {
      toast.error("Table number is not available")
      return
    }

    const newSeatNumbers = Array.from({ length: numberOfSeats }, (_, i) => {
      return `${tableNumber}${(i + 1).toString().padStart(2, "0")}`
    })

    setSeatNumbers(newSeatNumbers)
    toast.success("Seats auto-filled!")
  }

  const getSeatPosition = (index: number, totalSeats: number) => {
    const angle = (index * 2 * Math.PI) / totalSeats - Math.PI / 2
    const radius = 45
    const left = `${42 + Math.cos(angle) * radius}%`
    const top = `${42 + Math.sin(angle) * radius}%`
    return { left, top }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[96vh] sm:h-[94vh] p-0">
        <ScrollArea className="h-full">
          <div className="relative">
            <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />

            <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
              <SheetHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-lime-100 to-lime-100">
                    <Table2 className="w-6 h-6 text-lime-600" />
                  </div>
                  <SheetTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-lime-600 to-lime-600">
                    Add New Table
                  </SheetTitle>
                </div>
                <p className="text-muted-foreground text-sm">Configure your table layout and seating arrangement</p>
              </SheetHeader>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-6 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-100 shadow-sm">
                    <div className="space-y-2">
                      <Label className="text-base font-medium text-zinc-700">Table Number</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-zinc-600">
                          {isLoading ? "Loading..." : `Table ${tableNumber}`}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-medium text-zinc-700">
                        Number of Seats: <span className="text-lime-600 font-semibold">{numberOfSeats}</span>
                      </Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleSeatsChange([Math.max(1, numberOfSeats - 1)])}
                          disabled={numberOfSeats <= 1}
                          className="h-12 w-12 rounded-xl transition-transform active:scale-95"
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <Slider
                          value={[numberOfSeats]}
                          onValueChange={handleSeatsChange}
                          min={1}
                          max={10}
                          step={1}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleSeatsChange([Math.min(10, numberOfSeats + 1)])}
                          disabled={numberOfSeats >= 10}
                          className="h-12 w-12 rounded-xl transition-transform active:scale-95"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-medium text-zinc-700">Quick Fill Options</Label>
                      <Button
                        type="button"
                        onClick={handleMagicFill}
                        className="h-12 w-full items-center justify-center space-x-2 bg-gradient-to-r from-lime-500 to-lime-500 text-white hover:from-lime-600 hover:to-lime-600 transition-all duration-200 rounded-xl shadow-md hover:shadow-lg active:scale-95"
                      >
                        <Wand2 className="w-5 h-5" />
                        <span>Auto-Fill Seats</span>
                      </Button>
                    </div>
                  </div>

                  <div className="relative bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm w-full aspect-square flex items-center justify-center max-w-[500px] mx-auto lg:mx-0">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <motion.div
                        className="w-32 h-32 rounded-full bg-gradient-to-br from-lime-100 to-lime-100 border-2 border-lime-200 flex items-center justify-center shadow-lg z-10"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-2xl font-bold text-lime-600">
                          {isLoading ? "..." : `Table ${tableNumber}`}
                        </span>
                      </motion.div>

                      <div className="absolute inset-0">
                        <AnimatePresence>
                          {Array.from({ length: numberOfSeats }).map((_, index) => {
                            const { left, top } = getSeatPosition(index, numberOfSeats)

                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="absolute"
                                style={{
                                  left,
                                  top,
                                  transform: "translate(-50%, -50%)",
                                }}
                              >
                                <div className="relative group">
                                  <div className="absolute -inset-0.5 bg-gradient-to-br from-lime-500 to-lime-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur" />
                                  <Input
                                    type="number"
                                    placeholder={`${index + 1}`}
                                    value={seatNumbers[index] || ""}
                                    onChange={(e) => handleSeatNumberChange(index, e.target.value)}
                                    className={cn(
                                      "w-20 h-12 text-center rounded-full bg-white shadow-md transition-all duration-200",
                                      "text-sm font-medium focus-visible:ring-2 focus-visible:ring-lime-500",
                                      "sm:w-20 sm:h-14",
                                      "relative",
                                    )}
                                    required
                                    min="1"
                                  />
                                </div>
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-4 border-t mt-auto">
                  <div className="flex flex-col sm:flex-row gap-3 max-w-5xl mx-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="h-12 flex-1 text-base hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors duration-200 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className="h-12 flex-1 text-base bg-gradient-to-r from-lime-500 to-lime-500 text-white hover:from-lime-600 hover:to-lime-600 transition-all duration-200 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      {isSubmitting ? "Adding..." : "Add Table"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

