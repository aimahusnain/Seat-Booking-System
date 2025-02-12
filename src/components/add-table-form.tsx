"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { Minus, Plus, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface AddTableFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddTableForm({ isOpen, onClose, onSuccess }: AddTableFormProps) {
  const [tableName, setTableName] = useState("")
  const [numberOfSeats, setNumberOfSeats] = useState(10) // Default to 10 seats
  const [seatNumbers, setSeatNumbers] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [magicNumber, setMagicNumber] = useState("")

  // Update seat numbers array when number of seats changes
  const updateSeatNumbers = (count: number) => {
    setSeatNumbers(Array(count).fill(""))
  }

  // Initialize or update seat numbers when number of seats changes
  const handleSeatsChange = (value: number[]) => {
    const newCount = value[0]
    setNumberOfSeats(newCount)
    updateSeatNumbers(newCount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/add-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tableName,
          seats: seatNumbers.map((num) => Number.parseInt(num || "0")),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Table added successfully")
        onSuccess()
        onClose()
        setTableName("")
        setNumberOfSeats(5)
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
    const num = Number.parseInt(magicNumber)
    if (isNaN(num)) {
      toast.error("Please enter a valid number")
      return
    }

    setTableName(`Table${num}`)

    const newSeatNumbers = Array.from({ length: numberOfSeats }, (_, i) => {
      if (num < 10) {
        return `${num}0${i + 1}`
      }
      return `${num}${i + 1 < 10 ? "0" : ""}${i + 1}`
    })

    setSeatNumbers(newSeatNumbers)
    setMagicNumber("")
    toast.success("Magic fill applied!")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-indigo-800">Add New Table</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="space-y-6">
            {/* Number of Seats Selector */}
            <div className="space-y-4">
              <Label>Number of Seats: {numberOfSeats}</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleSeatsChange([Math.max(1, numberOfSeats - 1)])}
                  disabled={numberOfSeats <= 1}
                >
                  <Minus className="h-4 w-4" />
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
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative w-[600px] h-[600px] mx-auto">
              {/* Center Input for Table Name */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-40">
                <Input
                  placeholder="Table Name"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  required
                />
              </div>

              {/* Circular Seat Number Inputs */}
              {Array.from({ length: numberOfSeats }).map((_, index) => {
                const angle = ((index - numberOfSeats / 4) * 2 * Math.PI) / numberOfSeats
                const radius = 240
                const left = Math.cos(angle) * radius + 250
                const top = Math.sin(angle) * radius + 260

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="absolute"
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <Input
                      type="number"
                      placeholder={`Seat ${index + 1}`}
                      value={seatNumbers[index] || ""}
                      onChange={(e) => handleSeatNumberChange(index, e.target.value)}
                      className="w-20 h-14 text-center rounded-full"
                      required
                      min="1"
                    />
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Magic number"
                value={magicNumber}
                onChange={(e) => setMagicNumber(e.target.value)}
                className="w-32"
              />
              <Button
                type="button"
                onClick={handleMagicFill}
                variant="outline"
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white hover:from-purple-500 hover:to-pink-600"
              >
                <Wand2 className="w-4 h-4" />
                <span>Magic Fill</span>
              </Button>
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose} className="hover:bg-red-50 hover:text-red-600">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                {isSubmitting ? "Adding..." : "Add Table"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

