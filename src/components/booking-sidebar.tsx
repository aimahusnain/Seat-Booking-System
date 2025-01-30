"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Seat } from "@/types/booking";
import { Calendar, Clock, Trash2, User } from "lucide-react";
import { useMemo } from "react";
import PrintableBooking from "./single-seat-pdf";

interface BookingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  bookedSeats: Seat[];
  onDeleteBooking: (seatId: string) => void;
  onExportPDF: () => void;
}

interface GroupedBooking {
  userId: string;
  firstName: string;
  lastName: string;
  seats: Seat[];
}

export function BookingSidebar({
  isOpen,
  onClose,
  bookedSeats,
  onDeleteBooking,
}: BookingSidebarProps) {
  const groupedBookings = useMemo(() => {
    const groupedMap = bookedSeats.reduce((acc, seat) => {
      if (seat.user) {
        const { id, firstname, lastname } = seat.user;
        if (!acc[id]) {
          acc[id] = {
            userId: id,
            firstName: firstname,
            lastName: lastname,
            seats: [],
          };
        }
        acc[id].seats.push(seat);
      }
      return acc;
    }, {} as Record<string, GroupedBooking>);

    return Object.values(groupedMap);
  }, [bookedSeats]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md flex flex-col bg-gradient-to-br from-slate-50 to-white">
        <SheetHeader className="space-y-4 pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Booked Seats
              </SheetTitle>
              <p className="text-sm text-slate-500">
                Manage your seat reservations
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2 text-black px-3 py-1.5 rounded-full text-sm font-medium">
              <Calendar className="h-4 w-4" />
              {bookedSeats.length} Active Bookings
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4 mt-6">
          <div className="space-y-4">
            {groupedBookings.map((booking) => (
              <div
                key={booking.userId}
                className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {booking.firstName} {booking.lastName}
                        </h3>
                        <p className="text-cyan-100 text-sm">
                          {booking.seats.length}{" "}
                          {booking.seats.length === 1 ? "Seat" : "Seats"} Reserved
                        </p>
                      </div>
                    </div>
                    <PrintableBooking
                      firstName={booking.firstName}
                      lastName={booking.lastName}
                      seats={booking.seats}
                    />
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {booking.seats.map((seat) => (
                    <div
                      key={seat.id}
                      className="flex justify-between items-center bg-slate-50 p-3 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-700">
                            Table {seat.tableNumber}
                          </span>
                          <p className="text-xs text-slate-500">
                            Seat {seat.seatNumber}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteBooking(seat.id)}
                        className="hover:bg-red-50 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}