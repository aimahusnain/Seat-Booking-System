"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useGuests } from "../hooks/useGuests"
import type { Person } from "../types/booking"
import { Search } from "lucide-react"

interface PersonSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (person: Person) => void
}

export function PersonSelector({ isOpen, onClose, onSelect }: PersonSelectorProps) {
  const { guests, loading, error } = useGuests()
  const [searchTerm, setSearchTerm] = useState("")

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading guests...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error loading guests</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const filteredGuests = guests.filter((guest) =>
    `${guest.firstname} ${guest.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Person</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Select a person to assign to this seat</p>
        </DialogHeader>
        <div className="relative mt-4">
          <Input
            type="text"
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <div className="grid gap-4 mt-4">
          {filteredGuests.map((guest) => (
            <div
              key={guest.id}
              className="relative p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all group"
              onClick={() =>
                onSelect({
                  id: guest.id,
                  firstName: guest.firstname,
                  lastName: guest.lastname,
                })
              }
            >
              {/* Booking Count Badge */}
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium shadow-sm">
                {guest.seat.length}
              </div>

              <div className="space-y-2">
                {/* Name */}
                <div className="font-medium text-lg flex items-center gap-2">
                  {guest.firstname} {guest.lastname}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({guest.seat.length} {guest.seat.length === 1 ? "booking" : "bookings"})
                  </span>
                </div>

                {/* Current Bookings */}
                {guest.seat.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Current Bookings:</div>
                    <div className="flex flex-wrap gap-2">
                      {guest.seat.map((seat) => (
                        <span
                          key={seat.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {seat.table.name} • Seat {seat.seat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Hover Effect Indicator */}
              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

