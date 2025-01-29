"use client";

import { useState, useRef, useEffect } from "react";
import { PersonSelector } from "./person-selector";
import { BookingSidebar } from "./booking-sidebar";
import { PDFExport } from "./pdf-export";
import { useSeats } from "../hooks/useSeats";
import type { Person, Seat, TableData } from "../types/booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// Custom hook for responsive breakpoints
const useResponsiveLayout = () => {
  const [layout, setLayout] = useState({
    tablesPerPage: 12,
    isMobile: false,
    isTablet: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setLayout({ tablesPerPage: 4, isMobile: true, isTablet: false });
      } else if (width < 1024) {
        setLayout({ tablesPerPage: 8, isMobile: false, isTablet: true });
      } else {
        setLayout({ tablesPerPage: 12, isMobile: false, isTablet: false });
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return layout;
};

const SeatBooking = () => {
  const { seats: initialSeats } = useSeats();
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isPersonSelectorOpen, setIsPersonSelectorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookedSeats, setBookedSeats] = useState<Seat[]>([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [personToBook, setPersonToBook] = useState<Person | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const pdfExportRef = useRef<{ generatePDF: () => void } | null>(null);
  const router = useRouter();
  const { tablesPerPage } = useResponsiveLayout();

  useEffect(() => {
    if (initialSeats.length > 0) {
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

      const formattedTables: TableData[] = Object.entries(groupedSeats).map(
        ([tableNumber, seats]) => ({
          tableNumber: Number.parseInt(tableNumber),
          seats: seats.sort((a, b) => a.seatNumber - b.seatNumber),
        })
      );

      setTables(formattedTables);
      setBookedSeats(initialSeats.filter((seat) => seat.isBooked));
    }
  }, [initialSeats]);

  const getVisibleTables = () => {
    return tables.slice(
      currentSection * tablesPerPage,
      currentSection * tablesPerPage + tablesPerPage
    );
  };

  const maxSections = () => {
    return Math.ceil(tables.length / tablesPerPage);
  };

  // Rest of your component logic remains the same
  const handleSeatClick = (seat: Seat) => {
    if (!seat.isBooked) {
      setSelectedSeat(seat);
      setIsPersonSelectorOpen(true);
    }
  };

  const handlePersonSelect = (person: Person) => {
    if (selectedSeat) {
      setPersonToBook(person);
      setIsConfirmationOpen(true);
      setIsPersonSelectorOpen(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (selectedSeat && personToBook) {
      setIsConfirmationOpen(false);

      try {
        toast.loading("Booking seat...");

        const response = await fetch("/api/update-seat", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seatId: selectedSeat.id,
            userId: personToBook.id,
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
                    bookedBy: personToBook,
                    userId: personToBook.id,
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
              bookedBy: personToBook,
              userId: personToBook.id,
            },
          ]);

          toast.success("Seat booked successfully", {
            description: `${personToBook.firstName} ${personToBook.lastName} is assigned to Table ${selectedSeat.tableNumber}, Seat ${selectedSeat.seatNumber}`,
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
        setPersonToBook(null);
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
              ? {
                  ...seat,
                  isBooked: false,
                  bookedBy: undefined,
                  userId: undefined,
                }
              : seat
          ),
        }));

        setTables(updatedTables);
        setBookedSeats(bookedSeats.filter((seat) => seat.id !== seatId));
        toast.success("Booking Deleted", {
          description: "The booking has been successfully deleted.",
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
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-2 md:px-4">
        <Card className="mb-4 md:mb-8">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold">
                Seat Booking System
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Click on any available seat to make a booking
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                className="flex items-center gap-2 flex-1 md:flex-none justify-center"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">View Bookings</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.refresh()}
                className="flex-1 md:flex-none"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:gap-8">
              <div className="overflow-x-auto rounded-lg border bg-white">
                <div className="flex justify-between items-center p-2 bg-gray-50 border-b">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentSection((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentSection === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    Section {currentSection + 1} of {maxSections()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentSection((prev) =>
                        Math.min(maxSections() - 1, prev + 1)
                      )
                    }
                    disabled={currentSection === maxSections() - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        {getVisibleTables().map((table) => (
                          <th
                            key={table.tableNumber}
                            className="p-2 md:p-3 border-b text-center font-semibold text-sm md:text-base"
                          >
                            Table {table.tableNumber}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 10 }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                          {getVisibleTables().map((table) => {
                            const seat = table.seats[rowIndex];
                            return (
                              <td
                                key={seat.id}
                                className={`p-2 md:p-3 text-center transition-colors text-sm md:text-base ${
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

      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to book Table {selectedSeat?.tableNumber},
              Seat {selectedSeat?.seatNumber} for {personToBook?.firstName}{" "}
              {personToBook?.lastName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmationOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking} className="w-full sm:w-auto">
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SeatBooking