"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Trash2, Printer, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Seat } from "@/types/booking"

interface BookingSidebarProps {
  isOpen: boolean
  onClose: () => void
  bookedSeats: Seat[]
  onDeleteBooking: (seatId: string) => void
  onExportPDF: () => void
}

export function BookingSidebar({ isOpen, onClose, bookedSeats, onDeleteBooking, onExportPDF }: BookingSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
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
              Export PDF
            </Button>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-180px)] pr-4 mt-6">
          <div className="space-y-4">
            {bookedSeats.map((seat) => (
              <div
                key={seat.id}
                className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-blue-600">Table {seat.tableNumber}</div>
                  <div className="text-sm font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    Seat {seat.seatNumber}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium text-gray-900">
                    {seat.bookedBy?.firstName} {seat.bookedBy?.lastName}
                  </span>
                </div>
                <Button variant="destructive" size="sm" className="w-full" onClick={() => onDeleteBooking(seat.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Booking
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

