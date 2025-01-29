"use client";

import { useState, useRef, useEffect } from "react";
import { PersonSelector } from "./person-selector";
import { BookingSidebar } from "./booking-sidebar";
import { PDFExport } from "./pdf-export";
import { useSeats } from "../hooks/useSeats";
import type { Person, Seat, TableData } from "../types/booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SeatBooking() {
  const { seats: initialSeats } = useSeats();
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isPersonSelectorOpen, setIsPersonSelectorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookedSeats, setBookedSeats] = useState<Seat[]>([]);
  const pdfExportRef = useRef<{ generatePDF: () => void } | null>(null);

  useEffect(() => {
    if (initialSeats.length > 0) {
      // Group seats by table
      const groupedSeats = initialSeats.reduce(
        (acc: { [key: number]: Seat[] }, seat) => {
          if (!acc[seat.tableNumber]) {
            acc[seat.tableNumber] = [];
          }
          acc[seat.tableNumber].push(seat);
          return acc;
        },
        {}
      );

      // Convert to TableData format
      const formattedTables: TableData[] = Object.entries(groupedSeats).map(
        ([tableNumber, seats]) => ({
          tableNumber: parseInt(tableNumber),
          seats: seats.sort((a, b) => a.seatNumber - b.seatNumber),
        })
      );

      setTables(formattedTables);
      setBookedSeats(initialSeats.filter((seat) => seat.isBooked));
    }
  }, [initialSeats]);

  const handleSeatClick = (seat: Seat) => {
    if (!seat.isBooked) {
      setSelectedSeat(seat);
      setIsPersonSelectorOpen(true);
    }
  };

  const handlePersonSelect = async (person: Person) => {
    if (selectedSeat) {
      setIsPersonSelectorOpen(false); // Close dialog immediately for better UX
      
      try {
        toast.loading("Booking seat...");
        
        const response = await fetch("/api/update-seat", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seatId: selectedSeat.id,
            userId: person.id,
          }),
        });
  
        const result = await response.json();
  
        if (result.success) {
          const updatedTables = tables.map((table) => ({
            ...table,
            seats: table.seats.map((seat) =>
              seat.id === selectedSeat.id
                ? {
                    ...seat,
                    isBooked: true,
                    bookedBy: person,
                    userId: person.id,
                  }
                : seat
            ),
          }));
  
          setTables(updatedTables);
          setBookedSeats([
            ...bookedSeats,
            {
              ...selectedSeat,
              isBooked: true,
              bookedBy: person,
              userId: person.id,
            },
          ]);
          
          toast.success("Seat booked successfully", {
            description: `${person.firstName} ${person.lastName} is assigned to Table ${selectedSeat.tableNumber}, Seat ${selectedSeat.seatNumber}`,
          });
        } else {
          toast.error("Booking failed", {
            description: result.message || "Unable to book the seat",
          });
        }
      } catch (error) {
        toast.error("Booking failed", {
          description: `An unexpected error occurred ${error}`,
        });
      } finally {
        setSelectedSeat(null);
        setIsSidebarOpen(true);
      }
    }
  };

  const handleDeleteBooking = async (seatId: string) => {
    try {
      const response = await fetch("/api/delete-booking", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seatId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedTables = tables.map((table) => ({
          ...table,
          seats: table.seats.map((seat) =>
            seat.id === seatId
              ? { ...seat, isBooked: false, bookedBy: undefined, userId: undefined }
              : seat
          ),
        }));

        setTables(updatedTables);
        setBookedSeats(bookedSeats.filter((seat) => seat.id !== seatId));
        toast.success("Booking Deleted", {
          description: `The booking has been successfully deleted.`,
        });
      } else {
        toast.error("Delete Failed", {
          description: "There was an error deleting the booking.",
        });
      }
    } catch (error) {
      toast.error("Delete Failed", {
        description: `An unexpected error occurred while deleting the booking ${error}`,
      });
    }
  };

  const handleExportPDF = () => {
    if (pdfExportRef.current) {
      pdfExportRef.current.generatePDF();
      toast.success("PDF Generated", {
        description: "Your PDF has been generated and is ready for download.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Seat Booking System
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Click on any available seat to make a booking
              </p>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Users className="h-4 w-4" />
              View Bookings
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8">
              {/* Tables 1-12 */}
              <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      {tables.slice(0, 12).map((table) => (
                        <th
                          key={table.tableNumber}
                          className="p-3 border-b text-center font-semibold"
                        >
                          Table {table.tableNumber}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }).map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {tables.slice(0, 12).map((table) => {
                          const seat = table.seats[rowIndex];
                          return (
                            <td
                              key={seat.id}
                              className={`p-3 text-center transition-colors ${
                                seat.isBooked
                                  ? "bg-red-50 text-red-500 font-semibold"
                                  : "hover:bg-blue-50 cursor-pointer"
                              }`}
                              onClick={() => handleSeatClick(seat)}
                            >
                              {seat.isBooked ? "X" : seat.seatNumber}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tables 13-24 */}
              <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      {tables.slice(12).map((table) => (
                        <th
                          key={table.tableNumber}
                          className="p-3 border-b text-center font-semibold"
                        >
                          Table {table.tableNumber}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }).map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {tables.slice(12).map((table) => {
                          const seat = table.seats[rowIndex];
                          return (
                            <td
                              key={seat.id}
                              className={`p-3 text-center transition-colors ${
                                seat.isBooked
                                  ? "bg-red-50 text-red-500 font-semibold"
                                  : "hover:bg-blue-50 cursor-pointer"
                              }`}
                              onClick={() => handleSeatClick(seat)}
                            >
                              {seat.isBooked ? "X" : seat.seatNumber}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PersonSelector
        isOpen={isPersonSelectorOpen}
        onClose={() => setIsPersonSelectorOpen(false)}
        onSelect={handlePersonSelect}
      />

      <BookingSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        bookedSeats={bookedSeats}
        onDeleteBooking={handleDeleteBooking}
        onExportPDF={handleExportPDF}
      />

      <PDFExport bookedSeats={bookedSeats} ref={pdfExportRef} />
    </div>
  );
}
