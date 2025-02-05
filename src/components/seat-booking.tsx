"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getPasswordHash } from "@/hooks/usePassword";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  PersonStandingIcon,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSeats } from "../hooks/useSeats";
import type { Person, Seat, TableData } from "../types/booking";
import { AddGuestForm } from "./add-guest-form";
import { AddTableForm } from "./add-table-form";
import { BookingSidebar } from "./booking-sidebar";
import ChangePasswordForm from "./change-password-dialog";
import { HelpButton } from "./help-dropdown";
import { ImportGuestsforWeb } from "./import-guests-form";
import { PDFExport } from "./pdf-export";
import { PersonSelector } from "./person-selector";

const SeatBooking = () => {
  const { seats: initialSeats, loading, error } = useSeats();
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isPersonSelectorOpen, setIsPersonSelectorOpen] = useState(false);
  const [bookedSeats, setBookedSeats] = useState<Seat[]>([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [personToBook, setPersonToBook] = useState<Person | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const pdfExportRef = useRef<{ generatePDF: () => void } | null>(null);
  const router = useRouter();
  const [hoveredTable, setHoveredTable] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<number | null>(null);
  // const [searchTerm, setSearchTerm] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);

  useEffect(() => {
    if (initialSeats.length > 0) {
      const groupedSeats = initialSeats.reduce(
        (acc: { [key: string]: Seat[] }, seat) => {
          if (!acc[seat.table.name]) {
            acc[seat.table.name] = [];
          }
          acc[seat.table.name].push(seat);
          return acc;
        },
        {}
      );

      const formattedTables: TableData[] = Object.entries(groupedSeats)
        .map(([tableName, seats]) => ({
          tableNumber: Number.parseInt(tableName.replace("Table", "")),
          seats: seats.sort((a, b) => a.seat - b.seat),
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
    return tables;
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.isBooked) {
      // Toggle received status when clicking a booked seat
      handleToggleReceived(seat.id, !seat.isReceived);
    } else {
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
                      seat: [],
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
                seat: [],
              },
            },
          ]);

          toast.success(
            <div className="flex flex-col gap-1">
              <div className="font-semibold">Booking Confirmed! ✨</div>
              <div className="text-sm opacity-90">
                {personToBook.firstName} {personToBook.lastName} is assigned to
                Table {selectedSeat.table.name}, Seat {selectedSeat.seat}
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

  async function sha256(message: string) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  }

  const handleDeleteTable = async (tableNumber: number) => {
    try {
      const storedHash = await getPasswordHash();
      const inputHash = await sha256(deletePassword);

      if (deleteConfirmText !== `Delete Table ${tableNumber}`) {
        toast.error("Please type the exact confirmation text");
        return;
      }

      if (inputHash !== storedHash) {
        toast.error("Incorrect password");
        return;
      }

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
          bookedSeats.filter(
            (seat) => seat.table.name !== `Table${tableNumber}`
          )
        );
        router.refresh();
        setIsDeleteDialogOpen(false);
        setDeleteConfirmText("");
        setDeletePassword("");
      } else {
        throw new Error(result.message || "Failed to delete table");
      }
    } catch (error) {
      toast.error("Failed to delete table", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const renderCircularTable = (table: TableData) => {
    const tableColor = getTableColor(table.tableNumber);
    const isHovered = hoveredTable === table.tableNumber;

    return (
      <motion.div
        className={`relative w-full aspect-square mx-auto ${
          isFullScreen ? "max-w-[500px]" : "max-w-[300px]"
        }`}
        onMouseEnter={() => setHoveredTable(table.tableNumber)}
        onMouseLeave={() => setHoveredTable(null)}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
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
                            ? "cursor-pointer " +
                              (seat.isReceived
                                ? "bg-green-200 border-green-300 text-green-600"
                                : "bg-red-200 border-red-300 text-red-600")
                            : hoveredSeat === seat.id
                            ? `${tableColor} cursor-pointer`
                            : `bg-white hover:${tableColor} cursor-pointer`
                        }
                        border-2
                      `}
                      onMouseEnter={() => setHoveredSeat(seat.id)}
                      onMouseLeave={() => setHoveredSeat(null)}
                    >
                      {seat.isBooked ? (
                        seat.isReceived ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="font-bold text-lg">X</span>
                        )
                      ) : (
                        <span
                          className={`text-sm font-medium ${
                            isFullScreen ? "text-lg" : ""
                          }`}
                        >
                          {seat.seat}
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
                          {seat.table.name}, Seat {seat.seat}
                        </p>
                        <p className="text-xs font-medium">
                          Status: {seat.isReceived ? "Arrived" : "Not Arrived"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click to{" "}
                          {seat.isReceived
                            ? "mark as not arrived"
                            : "mark as arrived"}
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
      </motion.div>
    );
  };

  const handleFullScreenToggle = (checked: boolean) => {
    setIsFullScreen(checked);
    if (checked) {
      toast.info("Press Esc to exit full-screen mode");
    }
  };

  const handleChangePassword = async () => {
    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Password changed successfully");
        setIsChangePasswordOpen(false);
      } else {
        toast.error("Failed to change password");
      }
    } catch (error) {
      toast.error(`An error occurred while changing the password ${error}`);
    }
  };

  const handleToggleReceived = async (seatId: string, isReceived: boolean) => {
    try {
      const response = await fetch("/api/update-seat-received", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seatId,
          isReceived,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedTables = tables.map((table) => ({
          ...table,
          seats: table.seats.map((seat) =>
            seat.id === seatId ? { ...seat, isReceived } : seat
          ),
        }));

        setTables(updatedTables);
        setBookedSeats(
          bookedSeats.map((seat) =>
            seat.id === seatId ? { ...seat, isReceived } : seat
          )
        );

        toast.success(
          `Seat ${isReceived ? "marked as arrived" : "unmarked as arrived"}`
        );
      } else {
        throw new Error(
          result.message || "Failed to update seat arrived status"
        );
      }
    } catch (error) {
      toast.error("Failed to update seat arrived status", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={`bg-zinc-50 ${isFullScreen ? "overflow-hidden" : ""}`}>
      <AnimatePresence>
        {!isFullScreen && (
          <motion.nav
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="z-50 bg-white border-b border-zinc-200 px-4"
          >
            <div className="flex items-center justify-between h-14">
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
              {/* <div className="max-w-md w-full mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-10 bg-zinc-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div> */}

              {/* Right Section */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Full Screen</span>
                  <Switch
                    checked={isFullScreen}
                    onCheckedChange={handleFullScreenToggle}
                  />
                </div>

                <HelpButton />

                <Link href="/client-view">
                  <Button size="icon">
                    <PersonStandingIcon className="w-10 h-10" />
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      Create New
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setIsAddTableOpen(true)}
                    >
                      New Table
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setIsAddGuestOpen(true)}
                    >
                      New Guest
                    </DropdownMenuItem>
                    <ImportGuestsforWeb />
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback>JA</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <ChangePasswordForm />
                  </DropdownMenuContent>
                </DropdownMenu>
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
                  <motion.div
                    initial={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5 }}
                    className="sticky top-2 bg-white rounded-xl shadow-sm border-b border-zinc-100 z-40"
                  >
                    <div className="grid grid-cols-4 gap-3 w-full">
                      <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-2 text-center hover:shadow-sm transition-all">
                        <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
                          Seats
                        </div>
                        <div className="text-lg font-bold text-zinc-800">
                          {tables.reduce(
                            (total, table) => total + table.seats.length,
                            0
                          )}
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg border border-red-200 p-2 text-center hover:shadow-sm transition-all">
                        <div className="text-xs uppercase tracking-wider text-red-600 mb-1">
                          Booked
                        </div>
                        <div className="text-lg font-bold text-red-800">
                          {tables.reduce(
                            (booked, table) =>
                              booked +
                              table.seats.filter((seat) => seat.isBooked)
                                .length,
                            0
                          )}
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg border border-green-200 p-2 text-center hover:shadow-sm transition-all">
                        <div className="text-xs uppercase tracking-wider text-green-600 mb-1">
                          Available
                        </div>
                        <div className="text-lg font-bold text-green-800">
                          {tables.reduce(
                            (available, table) =>
                              available +
                              table.seats.filter((seat) => !seat.isBooked)
                                .length,
                            0
                          )}
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg border border-blue-200 p-2 text-center hover:shadow-sm transition-all">
                        <div className="text-xs uppercase tracking-wider text-blue-600 mb-1">
                          Arrived
                        </div>
                        <div className="text-lg font-bold text-blue-800">
                          {tables.reduce(
                            (arrived, table) =>
                              arrived +
                              table.seats.filter(
                                (seat) => seat.isBooked && seat.isReceived
                              ).length,
                            0
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-zinc-200"></div>
                      <span className="text-sm text-zinc-600">Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-200"></div>
                      <span className="text-sm text-zinc-600">Booked</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-200"></div>
                      <span className="text-sm text-zinc-600">Arrived</span>
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
              {getVisibleTables().map((table) => renderCircularTable(table))}
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
                onToggleReceived={handleToggleReceived}
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
                    {selectedSeat?.table.name}, Seat {selectedSeat?.seat}
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
            <Button onClick={handleConfirmBooking}>Confirm Booking</Button>
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

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeleteConfirmText("");
            setDeletePassword("");
            setShowDeletePassword(false);
          }
        }}
      >
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

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="confirmText"
                className="text-sm font-medium text-gray-700"
              >
                Type &quot;<strong>Delete Table {tableToDelete}</strong>&quot;
                to confirm
              </label>
              <Input
                id="confirmText"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={`Delete Table ${tableToDelete}`}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Enter Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showDeletePassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
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
              disabled={
                deleteConfirmText !== `Delete Table ${tableToDelete}` ||
                !deletePassword
              }
            >
              Delete Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddGuestForm
        isOpen={isAddGuestOpen}
        onClose={() => setIsAddGuestOpen(false)}
        onSuccess={() => {
          setIsAddGuestOpen(false);
          router.refresh();
        }}
      />

      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-800">
              Change Password
            </DialogTitle>
            <DialogDescription className="mt-2">
              Enter your new password below.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsChangePasswordOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeatBooking;