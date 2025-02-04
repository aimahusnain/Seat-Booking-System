import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Seat } from "@/types/booking";
import { Search, Trash2, User } from "lucide-react";
import { useMemo, useState } from "react";
import PrintableBooking from "./single-seat-pdf";
import { Checkbox } from "@/components/ui/checkbox";

interface BookingSidebarProps {
  bookedSeats: Seat[];
  onDeleteBooking: (seatId: string) => void;
  onToggleReceived: (seatId: string, isReceived: boolean) => void;
}

export function BookingSidebar({
  bookedSeats,
  onDeleteBooking,
  onToggleReceived,
}: BookingSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookings = useMemo(() => {
    return bookedSeats.filter((seat) => {
      const searchString = searchTerm.toLowerCase();
      return (
        seat.user &&
        (seat.user.firstname.toLowerCase().includes(searchString) ||
          seat.user.lastname.toLowerCase().includes(searchString) ||
          `${seat.user.firstname} ${seat.user.lastname}`
            .toLowerCase()
            .includes(searchString))
      );
    });
  }, [bookedSeats, searchTerm]);

  return (
    <div className="flex flex-col h-full w-full max-w-xs shadow-lg">
      <div className="p-4 bg-white shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Booked Seats</h2>
        <div className="relative">
          <Input
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-sm rounded-full border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-3">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((seat) => (
              <div
                key={seat.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <div className="p-4 flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                      {seat.user?.firstname[0]}
                      {seat.user?.lastname[0]}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                      {seat.user?.firstname} {seat.user?.lastname}
                    </h3>
                    <p className="text-xs text-gray-500">{seat.table.name}</p>
                  </div>
                  <div className="flex-shrink-0 text-2xl font-bold text-indigo-600">
                    #{seat.seat}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`received-${seat.id}`}
                      checked={seat.isReceived}
                      onCheckedChange={(checked) =>
                        onToggleReceived(seat.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`received-${seat.id}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      Arrived
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PrintableBooking
                      firstName={seat.user?.firstname || ""}
                      lastName={seat.user?.lastname || ""}
                      seats={[seat]}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteBooking(seat.id)}
                      className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-medium">No bookings found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
