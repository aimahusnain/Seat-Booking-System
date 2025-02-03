"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";
import { useSeats } from "../hooks/useSeats";
import type { Person, Seat, TableData } from "../types/booking";
import { AddTableForm } from "./add-table-form";
import { PDFExport } from "./pdf-export";
import { PersonSelector } from "./person-selector";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookingSidebar } from "./booking-sidebar";
import { Switch } from "@/components/ui/switch";

const useResponsiveLayout = () => {
  const [layout, setLayout] = useState({
    tablesPerPage: 12,
    isMobile: false,
    isTablet: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setLayout({ tablesPerPage: 1, isMobile: true, isTablet: false });
      } else if (width < 1024) {
        setLayout({ tablesPerPage: 4, isMobile: false, isTablet: true });
      } else {
        setLayout({ tablesPerPage: 100, isMobile: false, isTablet: false });
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
  const [bookedSeats, setBookedSeats] = useState<Seat[]>([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [personToBook, setPersonToBook] = useState<Person | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const pdfExportRef = useRef<{ generatePDF: () => void } | null>(null);
  const router = useRouter();
  const { tablesPerPage, isMobile } = useResponsiveLayout();
  const [hoveredTable, setHoveredTable] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
        toast.info("Exited full-screen mode");
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isFullScreen]);

  const getVisibleTables = () => {
    return tables.slice(
      currentSection * tablesPerPage,
      (currentSection + 1) * tablesPerPage
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

  const getTableColor = (tableNumber: number) => {
    const colors = [
      "bg-red-100 text-red-700 border-red-300",
      "bg-blue-100 text-blue-700 border-blue-300",
      "bg-green-100 text-green-700 border-green-300",
      "bg-yellow-100 text-yellow-700 border-yellow-300",
      "bg-purple-100 text-purple-700 border-purple-300",
      "bg-pink-100 text-pink-700 border-pink-300",
      "bg-indigo-100 text-indigo-700 border-indigo-300",
      "bg-teal-100 text-teal-700 border-teal-300",
    ];
    return colors[tableNumber % colors.length];
  };

  const handleDeleteTable = async (tableNumber: number) => {
    try {
      const response = await fetch(`/api/delete-table`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableNumber }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Table deleted successfully");
        setTables(tables.filter((t) => t.tableNumber !== tableNumber));
        setBookedSeats(
          bookedSeats.filter((seat) => seat.tableNumber !== tableNumber)
        );
        router.refresh();
      } else {
        throw new Error(result.message || "Failed to delete table");
      }
    } catch (error) {
      toast.error("Failed to delete table", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
    setIsDeleteDialogOpen(false);
  };

  const renderCircularTable = (table: TableData) => {
    const tableColor = getTableColor(table.tableNumber);
    const isHovered = hoveredTable === table.tableNumber;

    return (
      <div
        className={`relative w-full aspect-square mx-auto ${
          isFullScreen ? "max-w-[500px]" : "max-w-[300px]"
        }`}
        onMouseEnter={() => setHoveredTable(table.tableNumber)}
        onMouseLeave={() => setHoveredTable(null)}
      >
        {/* Center Table Label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div
            className={`relative ${tableColor} rounded-full px-4 py-2 transition-all duration-200 ease-in-out mt-5 ml-5`}
          >
            <span className="flex items-center justify-center">
              <span className={`font-semibold text-lg text-center`}>
                Table {table.tableNumber}
              </span>
            </span>

            {/* Delete Button - Shows on Hover */}
            {isHovered && !isFullScreen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-2 -right-2"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTableToDelete(table.tableNumber);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Table {table.tableNumber}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            )}
          </div>
        </div>

        {/* Circular Seats */}
        {table.seats.map((seat, index) => {
          const angle = ((index - 2.5) * 2 * Math.PI) / 10;
          const radius = 45; // Percentage of container width
          const left = 43 + Math.cos(angle) * radius;
          const top = 43 + Math.sin(angle) * radius;

          return (
            <motion.div
              key={seat.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`absolute ${
                isFullScreen ? "w-[20%]" : "w-[15%]"
              } aspect-square`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleSeatClick(seat)}
                      className={`
                        w-full h-full rounded-full cursor-pointer
                        flex items-center justify-center
                        transition-all duration-200
                        ${
                          seat.isBooked
                            ? "bg-red-200 border-red-300 text-red-600"
                            : hoveredSeat === seat.id
                            ? `${tableColor}`
                            : `bg-white hover:${tableColor}`
                        }
                        border-2
                      `}
                      onMouseEnter={() => setHoveredSeat(seat.id)}
                      onMouseLeave={() => setHoveredSeat(null)}
                    >
                      {seat.isBooked ? (
                        <span className="font-bold text-lg">X</span>
                      ) : (
                        <span
                          className={`text-sm font-medium ${
                            isFullScreen ? "text-lg" : ""
                          }`}
                        >
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

  const filteredBookedSeats = bookedSeats.filter((seat) =>
    `${seat.user?.firstname} ${seat.user?.lastname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleFullScreenToggle = (checked: boolean) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsFullScreen(checked);
      setIsTransitioning(false);
      if (checked) {
        toast.info("Press Esc to exit full-screen mode");
      }
    }, 500); // Adjust this delay to match your animation duration
  };

  return (
    <div
      className={`min-h-screen bg-zinc-50 ${
        isFullScreen ? "overflow-hidden" : ""
      }`}
    >
      <AnimatePresence>
        {!isFullScreen && (
          <motion.nav
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-4"
          >
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link
                href="/"
                className="flex justify-center items-center space-x-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-zinc-900"
                >
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                  <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                  <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-8" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
                <span className="text-xl font-bold text-zinc-900">
                  Seat Booking
                </span>
              </Link>

              {/* Search Bar */}
              <div className="max-w-md w-full mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-10 bg-zinc-50"
                  />
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      Create New
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsAddTableOpen(true)}>
                      New Table
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Full Screen</span>
                  <Switch
                    checked={isFullScreen}
                    onCheckedChange={handleFullScreenToggle}
                  />
                </div>

                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback>JA</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={`flex flex-col lg:flex-row ${
          isFullScreen ? "h-screen" : "h-[calc(100vh-64px)]"
        }`}
      >
        {/* Main Content - 80% on desktop, 100% on mobile */}
        <motion.div
          layout
          className={`w-full ${
            isFullScreen ? "" : "lg:w-3/4"
          } bg-zinc-50 overflow-hidden`}
          animate={{
            width: isFullScreen ? "100%" : "75%",
          }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence>
            {!isFullScreen && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="sticky top-2 mx-5 bg-white rounded-2xl border-b border-zinc-200 z-40"
              >
                <div className="flex justify-between items-center px-6 py-4">
                  <Tabs defaultValue="seat" className="w-[300px]">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="seat">Seats</TabsTrigger>
                      <TabsTrigger value="available">Available</TabsTrigger>
                      <TabsTrigger value="booked">Booked</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-zinc-200"></div>
                      <span className="text-sm text-zinc-600">Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-200"></div>
                      <span className="text-sm text-zinc-600">Booked</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scrollable Table Grid */}
          <ScrollArea
            className={`${isFullScreen ? "h-screen" : "h-[calc(100vh-144px)]"}`}
          >
            <motion.div
              layout
              className={`py-6 px-8 grid gap-12`}
              style={{
                gridTemplateColumns: isFullScreen
                  ? "repeat(4, minmax(0, 1fr))"
                  : "repeat(auto-fill, minmax(250px, 1fr))",
              }}
              transition={{ duration: 0.5 }}
            >
              {getVisibleTables().map((table) => (
                <motion.div
                  key={table.tableNumber}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                >
                  {renderCircularTable(table)}
                </motion.div>
              ))}
            </motion.div>
          </ScrollArea>
        </motion.div>

        <AnimatePresence>
          {!isFullScreen && (
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
              className="w-full lg:w-1/4 bg-white rounded-2xl overflow-hidden my-2 mr-5"
            >
              <BookingSidebar
                bookedSeats={bookedSeats}
                onDeleteBooking={handleDeleteBooking}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PersonSelector
        isOpen={isPersonSelectorOpen}
        onClose={() => setIsPersonSelectorOpen(false)}
        onSelect={handlePersonSelect}
      />

      <PDFExport bookedSeats={bookedSeats} ref={pdfExportRef} />

      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-800">
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
                <p className="text-sm text-zinc-600">
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
              className="w-full sm:w-auto bg-zinc-600 hover:bg-zinc-700 text-white"
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-800">
              Delete Table
            </DialogTitle>
            <DialogDescription className="mt-2">
              <div className="space-y-2">
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="font-medium text-red-700">
                    Are you sure you want to delete Table {tableToDelete}?
                  </p>
                  <p className="text-red-600 text-sm mt-2">
                    This will permanently delete the table and all its seat
                    assignments. This action cannot be undone.
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => tableToDelete && handleDeleteTable(tableToDelete)}
              className="w-full sm:w-auto"
            >
              Delete Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeatBooking;
