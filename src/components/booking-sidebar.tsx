"use client"

import { useMemo } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Trash2, Printer, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SingleSeatPDF } from "./single-seat-pdf"
import type { Seat } from "@/types/booking"

interface BookingSidebarProps {
  isOpen: boolean
  onClose: () => void
  bookedSeats: Seat[]
  onDeleteBooking: (seatId: string) => void
  onExportPDF: () => void
}

interface GroupedBooking {
  userId: string
  firstName: string
  lastName: string
  seats: Seat[]
}

export function BookingSidebar({ isOpen, onClose, bookedSeats, onDeleteBooking, onExportPDF }: BookingSidebarProps) {
  const groupedBookings = useMemo(() => {
    const groupedMap = bookedSeats.reduce(
      (acc, seat) => {
        if (seat.user) {
          const { id, firstname, lastname } = seat.user
          if (!acc[id]) {
            acc[id] = {
              userId: id,
              firstName: firstname,
              lastName: lastname,
              seats: [],
            }
          }
          acc[id].seats.push(seat)
        }
        return acc
      },
      {} as Record<string, GroupedBooking>,
    )

    return Object.values(groupedMap)
  }, [bookedSeats])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">Booked Seats</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Total bookings: {bookedSeats.length}</div>
            <Button variant="outline" size="sm" onClick={onExportPDF}>
              <Printer className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1 pr-4 mt-6">
          <div className="space-y-4">
            {groupedBookings.map((booking) => (
              <div
                key={booking.userId}
                className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-blue-600">
                    {booking.firstName} {booking.lastName}
                  </div>
                  <div className="text-sm font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {booking.seats.length} {booking.seats.length === 1 ? "Booking" : "Bookings"}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium text-gray-900">Booked Seats:</span>
                </div>
                <div className="space-y-2">
                  {booking.seats.map((seat) => (
                    <div key={seat.id} className="flex justify-between items-center bg-white p-2 rounded-md">
                      <span className="text-sm">
                        Table {seat.tableNumber} • Seat {seat.seatNumber}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="hover:bg-blue-100 hover:text-blue-600">
                          <SingleSeatPDF seat={seat} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteBooking(seat.id)}
                          className="hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
          <a
            href="https://www.devkins.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors"
          >
            Made by Devkins
          </a>
        </div>
      </SheetContent>
    </Sheet>
  )
}

