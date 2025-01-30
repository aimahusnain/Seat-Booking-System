"use client";

import { useState, useRef, useEffect } from "react";
import { PersonSelector } from "./person-selector";
import { BookingSidebar } from "./booking-sidebar";
import { PDFExport } from "./pdf-export";
import { useSeats } from "../hooks/useSeats";
import type { Person, Seat, TableData } from "../types/booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RefreshCw,
  Users,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  Clock,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
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

      const formattedTables: TableData[] = Object.entries(groupedSeats)
        .map(([tableNumber, seats]) => ({
          tableNumber: Number.parseInt(tableNumber),
          seats: seats.sort((a, b) => a.seatNumber - b.seatNumber),
        }))
        .sort((a, b) => a.tableNumber - b.tableNumber);

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
        const toastId = toast.loading("Booking seat...");

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
                    userId: personToBook.id,
                    user: {
                      id: personToBook.id,
                      firstname: personToBook.firstName,
                      lastname: personToBook.lastName,
                    },
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
              userId: personToBook.id,
              user: {
                id: personToBook.id,
                firstname: personToBook.firstName,
                lastname: personToBook.lastName,
              },
            },
          ]);

          toast.success(
            <div className="flex flex-col gap-1">
              <div className="font-semibold">Booking Confirmed! ✨</div>
              <div className="text-sm opacity-90">
                {personToBook.firstName} {personToBook.lastName} is assigned to
                Table {selectedSeat.tableNumber}, Seat {selectedSeat.seatNumber}
              </div>
            </div>,
            { id: toastId, duration: 4000 }
          );
        } else {
          toast.error("Booking failed", {
            id: toastId,
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
      const toastId = toast.loading("Deleting booking...");

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
                  userId: null,
                  user: null,
                }
              : seat
          ),
        }));

        setTables(updatedTables);
        setBookedSeats(bookedSeats.filter((seat) => seat.id !== seatId));

        toast.success(
          <div className="flex flex-col gap-1">
            <div className="font-semibold">Booking Deleted</div>
            <div className="text-sm opacity-90">
              The seat has been successfully freed up
            </div>
          </div>,
          { id: toastId }
        );
      } else {
        toast.error("Delete Failed", {
          id: toastId,
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
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">PDF Generated Successfully</div>
          <div className="text-sm opacity-90">
            Your booking details are ready for download
          </div>
        </div>
      );
    }
  };

  const getBookingStats = () => {
    const total = tables.reduce((acc, table) => acc + table.seats.length, 0);
    const booked = bookedSeats.length;
    const available = total - booked;
    const percentageBooked = Math.round((booked / total) * 100);

    return { total, booked, available, percentageBooked };
  };

  const renderCircularTable = (table: TableData) => {
    return (
      <div className="relative w-[250px] h-[250px] m-4">
        {/* Center Table Label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-white shadow-sm rounded-full p-4 border border-zinc-100">
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-zinc-500" />
              <span className="font-semibold">Table {table.tableNumber}</span>
            </span>
          </div>
        </div>

        {/* Circular Seats */}
        {table.seats.map((seat, index) => {
          // Calculate position in circle
          const angle = (index * 2 * Math.PI) / 10; // 10 seats per table
          const radius = 100; // Radius of the circle
          const left = Math.cos(angle) * radius + 125;
          const top = Math.sin(angle) * radius + 125;

          return (
            <motion.div
              key={seat.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="absolute"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleSeatClick(seat)}
                      className={`
                        w-12 h-12 rounded-full cursor-pointer
                        flex items-center justify-center
                        transition-all duration-200
                        ${
                          seat.isBooked
                            ? "bg-red-50 border-red-200"
                            : hoveredSeat === seat.id
                            ? "bg-zinc-50 border-zinc-300"
                            : "bg-white hover:bg-zinc-50/50"
                        }
                        border shadow-sm
                      `}
                      onMouseEnter={() => setHoveredSeat(seat.id)}
                      onMouseLeave={() => setHoveredSeat(null)}
                    >
                      {seat.isBooked ? (
                        <span className="text-red-500 font-bold text-lg">
                          X
                        </span>
                      ) : (
                        <span className="text-sm font-medium">
                          {seat.seatNumber}
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {seat.isBooked ? (
                      <div className="text-center">
                        <p className="font-semibold">
                          Booked by {seat.user?.firstname} {seat.user?.lastname}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Table {seat.tableNumber}, Seat {seat.seatNumber}
                        </p>
                      </div>
                    ) : (
                      <p>Click to book this seat</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-zinc-50 py-4 md:py-8">
      <div className="container mx-auto px-2 md:px-4">
        <Card className="mb-4 md:mb-8 border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="text-xl md:text-4xl font-bold text-black">
                Seat Booking System
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Click on any available seat to make a booking
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 flex-1 md:flex-none justify-center hover:bg-zinc-50/50"
                      onClick={() => setIsSidebarOpen(true)}
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden md:inline">View Bookings</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View all current bookings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => router.refresh()}
                      className="flex-1 md:flex-none hover:bg-zinc-50/50"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh booking data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>

          <CardContent>
            {/* Booking Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(getBookingStats()).map(([key, value]) => (
                <Card key={key} className="bg-white/50 border border-zinc-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-2xl font-bold text-zinc-600">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:gap-8">
              <div className="overflow-hidden rounded-xl border bg-white shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentSection((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentSection === 0}
                    className="hover:bg-zinc-100/50"
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
                    className="hover:bg-zinc-100/50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap justify-center">
                  {getVisibleTables().map((table) =>
                    renderCircularTable(table)
                  )}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-zinc-50 border border-zinc-200 rounded"></div>
                <span className="text-sm text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                <span className="text-sm text-muted-foreground">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-zinc-100 border border-zinc-200 rounded"></div>
                <span className="text-sm text-muted-foreground">Selected</span>
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
            <DialogTitle className="text-xl font-bold">
              Confirm Booking
            </DialogTitle>
            <DialogDescription className="mt-2">
              <div className="space-y-2">
                <div className="p-4 bg-zinc-50 rounded-lg">
                  <p className="font-medium text-zinc-700">
                    Table {selectedSeat?.tableNumber}, Seat{" "}
                    {selectedSeat?.seatNumber}
                  </p>
                  <p className="text-zinc-600">
                    {personToBook?.firstName} {personToBook?.lastName}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please confirm if you want to proceed with this booking.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsConfirmationOpen(false)}
              className="w-full sm:w-auto hover:bg-red-50 hover:text-red-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBooking}
              className="w-full sm:w-auto bg-gradient-to-r from-zinc-600 to-zinc-600 hover:from-zinc-700 hover:to-zinc-700 text-white"
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeatBooking;
