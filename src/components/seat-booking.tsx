"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  RefreshCw,
  Sparkles,
  Users,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSeats } from "../hooks/useSeats";
import type { Person, Seat, TableData } from "../types/booking";
import { BookingSidebar } from "./booking-sidebar";
import { PDFExport } from "./pdf-export";
import { PersonSelector } from "./person-selector";
import { AddTableForm } from "./add-table-form";

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
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
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

  const getTableColor = (tableNumber: number) => {
    const colors = [
      {
        bg: "from-red-100 to-red-200",
        text: "text-red-700",
        border: "border-red-300",
      },
      {
        bg: "from-blue-100 to-blue-200",
        text: "text-blue-700",
        border: "border-blue-300",
      },
      {
        bg: "from-green-100 to-green-200",
        text: "text-green-700",
        border: "border-green-300",
      },
      {
        bg: "from-yellow-100 to-yellow-200",
        text: "text-yellow-700",
        border: "border-yellow-300",
      },
      {
        bg: "from-purple-100 to-purple-200",
        text: "text-purple-700",
        border: "border-purple-300",
      },
      {
        bg: "from-pink-100 to-pink-200",
        text: "text-pink-700",
        border: "border-pink-300",
      },
      {
        bg: "from-indigo-100 to-indigo-200",
        text: "text-indigo-700",
        border: "border-indigo-300",
      },
      {
        bg: "from-orange-100 to-orange-200",
        text: "text-orange-700",
        border: "border-orange-300",
      },
    ];
    return colors[tableNumber % colors.length];
  };

  const renderCircularTable = (table: TableData) => {
    const tableColor = getTableColor(table.tableNumber);
    return (
      <div className="relative w-[300px] h-[300px] m-4">
        {/* Table Background */}
        {/* <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${tableColor.bg} opacity-80 ${tableColor.border}`}
        ></div> */}

        {/* Center Table Label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div
            className={`bg-white shadow-lg rounded-full p-4 ${tableColor.border}`}
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className={`h-5 w-5 ${tableColor.text}`} />
              <span className={`font-semibold text-lg ${tableColor.text}`}>
                Table {table.tableNumber}
              </span>
            </span>
          </div>
        </div>

        {/* Circular Seats */}
        {table.seats.map((seat, index) => {
          const angle = ((index - 2.5) * 2 * Math.PI) / 10;
          const radius = 130;
          const left = Math.cos(angle) * radius + 125;
          const top = Math.sin(angle) * radius + 125;

          return (
            <motion.div
              key={seat.id}
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
                            ? "bg-red-100 border-red-300 text-red-600"
                            : hoveredSeat === seat.id
                            ? `${tableColor.bg.split(" ")[1]} ${
                                tableColor.border
                              } ${tableColor.text}`
                            : `bg-white hover:${tableColor.bg.split(" ")[1]} ${
                                tableColor.text
                              }`
                        }
                        border-2 shadow-md hover:shadow-lg
                      `}
                      onMouseEnter={() => setHoveredSeat(seat.id)}
                      onMouseLeave={() => setHoveredSeat(null)}
                    >
                      {seat.isBooked ? (
                        <span className="font-bold text-lg">X</span>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="container mx-auto">
        <Card className="mb-8 border-none shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-gray-800">
                Seat Booking System
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Click on any available seat to make a booking
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setIsAddTableOpen(true)}>
                      <Plus className="h-4 w-4" />
                      <span className="hidden md:inline">Add Table</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a new table</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setIsSidebarOpen(true)}>
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
                    <Button variant="outline" onClick={() => router.refresh()}>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(getBookingStats()).map(([key, value]) => (
                <Card
                  key={key}
                  className="bg-white border border-gray-200 shadow-md"
                >
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-12 p-8">
              <div className="overflow-hidden rounded-xl border border-indigo-200 bg-white shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentSection((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentSection === 0}
                    className="hover:bg-indigo-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-indigo-600">
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
                    className="hover:bg-indigo-50"
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
            <div className="mt-8 flex flex-wrap gap-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-100 border-2 border-red-300 rounded-full"></div>
                <span className="text-sm text-gray-600">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 border-2 border-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Selected</span>
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
            <DialogTitle className="text-xl font-bold text-indigo-800">
              Confirm Booking
            </DialogTitle>
            <DialogDescription className="mt-2">
              <div className="space-y-2">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="font-medium text-indigo-700">
                    Table {selectedSeat?.tableNumber}, Seat{" "}
                    {selectedSeat?.seatNumber}
                  </p>
                  <p className="text-indigo-600">
                    {personToBook?.firstName} {personToBook?.lastName}
                  </p>
                </div>
                <p className="text-sm text-indigo-600">
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
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AddTableForm
        isOpen={isAddTableOpen}
        onClose={() => setIsAddTableOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
};

export default SeatBooking;
