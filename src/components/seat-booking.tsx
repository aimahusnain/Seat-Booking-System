"use client";

import PasswordVerificationDialog from "@/components/password-verification-dialog";
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
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  ChevronDown,
  FolderPen,
  Menu,
  PersonStandingIcon,
  RefreshCcw,
  ScanBarcode as ScanQrCode,
  Trash,
  Trash2,
  UserCheck2,
  Settings,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGuests } from "../hooks/useGuests";
import { useSeats } from "../hooks/useSeats";
import type { Person, Seat, TableData } from "../types/booking";
import { AddGuestForm } from "./add-guest-form";
import { AddTableForm } from "./add-table-form";
import { AssignGuestsDialog } from "./assign-guests-dialog";
import { BookingSidebar } from "./booking-sidebar";
import { BulkTableForm } from "./bulk-table-form";
import { ChangePasswordDialog } from "./change-password-dialog";
import { HelpButton } from "./help-dropdown";
import { ImportGuestsforWeb } from "./import-guests-form";
import Loader from "./loader";
import { PDFExport } from "./pdf-export";
import { PersonSelector } from "./person-selector";
import { EditTableDialog } from "./edit-table-dialog";
import WashupButton from "./washup";
import { FloorMapUploader } from "./FloorMapUploader";

const SeatBooking = () => {
  const {
    seats: initialSeats,
    loading,
    error,
    fetchSeats: refreshSeats,
  } = useSeats();
  const [isBulkTableDialogOpen, setBulkTableDialogOpen] = useState(false);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isPersonSelectorOpen, setIsPersonSelectorOpen] = useState(false);
  const [bookedSeats, setBookedSeats] = useState<Seat[]>([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [personToBook, setPersonToBook] = useState<Person | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const pdfExportRef = useRef<{ generatePDF: () => void } | null>(null);
  const router = useRouter();
  const [hoveredTable, setHoveredTable] = useState<string | number | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [totalGuests, setTotalGuests] = useState(0);
  const [showNames, setShowNames] = useState(false);
  const [isDeleteAllTablesDialogOpen, setIsDeleteAllTablesDialogOpen] =
    useState(false);
  const { data: session } = useSession();
  const {
    guests: allGuests,
    loading: guestsLoading,
    error: guestsError,
  } = useGuests();
  const [isAssignGuestsDialogOpen, setIsAssignGuestsDialogOpen] =
    useState(false);

  const [isEditTableDialogOpen, setIsEditTableDialogOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<{
    id: string | number;
    name: string;
    seats: number;
  } | null>(null);

  console.log(guestsLoading);
  console.log(guestsError);

  const getTableInfo = () => {
    return tables.map((table) => ({
      id: table.seats[0].tableId,
      name: table.seats[0]?.table?.name || `Table ${table.tableNumber}`, // Use actual table name from database
      seats: table.seats,
    }));
  };

  const handleAssignGuests = async (guestIds: string[], tableId: string) => {
    try {
      const response = await fetch("/api/assign-guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestIds, tableId }),
      });

      const data = await response.json();
      if (data.success) {
        refreshSeats();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  };
  console.log(error);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

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

  const handleBulkTableCreation = () => {
    setBulkTableDialogOpen(true);
  };

  const handleBulkTableSuccess = () => {
    refreshSeats();
    toast.success("Tables created successfully");
  };

  // Add fetch function
  const fetchTotalGuests = async () => {
    const response = await fetch("/api/get-total-guests");
    const data = await response.json();
    setTotalGuests(data.data);
  };

  useEffect(() => {
    fetchTotalGuests();
  }, []);

  const handleDeleteAllBookings = async () => {
    try {
      const toastId = toast.loading("Deleting all bookings...");

      const deletePromises = bookedSeats.map((seat) =>
        fetch("/api/delete-booking", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seatId: seat.id }),
        })
      );

      const results = await Promise.all(deletePromises);
      const allSuccessful = results.every(async (res) => {
        const data = await res.json();
        return data.success;
      });

      if (allSuccessful) {
        const updatedTables = tables.map((table) => ({
          ...table,
          seats: table.seats.map((seat) => ({
            ...seat,
            isBooked: false,
            userId: null,
            user: null,
          })),
        }));

        setTables(updatedTables);
        setBookedSeats([]);
        setIsDeleteAllDialogOpen(false);

        toast.success("All bookings deleted successfully", { id: toastId });
      } else {
        throw new Error("Some bookings failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete all bookings", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

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
        throw new Error(result.message || "Failed to delete the booking.");
      }
    } catch (error) {
      toast.error("Delete Failed", {
        description: `An unexpected error occurred while deleting the booking ${error}`,
      });
    }
  };

  const getTableColor = (index: number) => {
    const colors = [
      "bg-red-100 text-red-700 border-red-300",
      "bg-blue-100 text-blue-700 border-blue-300",
      "bg-green-100 text-green-700 border-green-300",
      "bg-yellow-100 text-yellow-700 border-yellow-300",
      "bg-lime-100 text-lime-700 border-lime-300",
      "bg-pink-100 text-pink-700 border-pink-300",
      "bg-indigo-100 text-indigo-700 border-indigo-300",
      "bg-teal-100 text-teal-700 border-teal-300",
    ];
    return colors[index % colors.length];
  };

  const handleDeleteTable = async (tableId: number) => {
    try {
      const response = await fetch(`/api/delete-table`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableId }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Table deleted successfully");
        setTables(tables.filter((t) => t.tableNumber !== tableId));
        setBookedSeats(
          bookedSeats.filter((seat) => seat.table.name !== `Table ${tableId}`)
        );
        router.refresh();
        setIsDeleteDialogOpen(false);
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

  const renderCircularTable = (table: TableData, index: number) => {
    const tableId = table.seats[0]?.table?.id || table.tableNumber;
    const tableName = table.seats[0]?.table?.name;
    const tableNumber = table.tableNumber;
    const displayName = tableName || `Table ${tableNumber}`;
    const tableColor = getTableColor(index);
    const isHovered = hoveredTable === tableId;

    return (
      <motion.div
        key={tableId}
        className={`relative w-full aspect-square mx-auto ${
          isFullScreen ? "max-w-[500px]" : "max-w-[300px]"
        } ${showNames ? "p-8" : ""}`} // Add padding when names are shown
        onMouseEnter={() => setHoveredTable(tableId)}
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
                {displayName}
              </span>
            </span>

            {/* Action Buttons - Shows on Hover */}
            {isHovered && !isFullScreen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-2 -right-2 flex gap-1"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          const actualTableId =
                            table.seats[0]?.table?.id || tableId;
                          setTableToEdit({
                            id: actualTableId,
                            name: displayName,
                            seats: table.seats.length,
                          });
                          setIsEditTableDialogOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit {displayName}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Existing Delete Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTableToDelete(tableId);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete {displayName}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            )}
          </div>
        </div>

        {/* Circular Seats */}
        {table.seats.map((seat, seatIndex) => {
          const countofseats = table.seats.length;
          const angle = ((seatIndex - 2.5) * 2 * Math.PI) / countofseats;
          const radius = 45;
          const left = 45 + Math.cos(angle) * radius;
          const top = 45 + Math.sin(angle) * radius;

          return (
            <motion.div
              key={seat.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: seatIndex * 0.05 }}
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
                          Booked for {seat.user?.firstname}{" "}
                          {seat.user?.lastname}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {seat.table.name}, Seat {seat.seat}
                        </p>
                        <p className="text-xs font-medium">
                          Status: {seat.isReceived ? "Arrived" : "Not Arrived"}
                        </p>
                        {/* <p className="text-xs text-muted-foreground mt-1">
                          Click to {seat.isReceived ? "mark as not arrived" : "mark as arrived"}
                        </p> */}
                      </div>
                    ) : (
                      <p>Click to book this seat</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {showNames && seat.isBooked && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute whitespace-nowrap pointer-events-none z-20"
                  style={{
                    // Calculate position further out from the seat position
                    left: `${45 + Math.cos(angle) * (radius + 12)}%`,
                    top: `${45 + Math.sin(angle) * (radius + 12)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span className="text-[0.60rem] font-medium text-zinc-600 bg-white/90 px-1.5 py-0.5 rounded shadow-sm block">
                    {seat.user?.firstname} {seat.user?.lastname}
                  </span>
                </motion.div>
              )}
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

  const handleDeleteAllTables = async () => {
    try {
      const toastId = toast.loading("Deleting all tables...");

      const response = await fetch("/api/delete-all-tables", {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setTables([]);
        setBookedSeats([]);
        setIsDeleteAllTablesDialogOpen(false);
        toast.success("All tables deleted successfully", { id: toastId });
      } else {
        throw new Error(result.message || "Failed to delete all tables");
      }
    } catch (error) {
      toast.error("Failed to delete all tables", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={`bg-zinc-50 ${isFullScreen ? "overflow-hidden" : ""}`}>

      <AnimatePresence>
        {!isFullScreen && (
          <motion.nav
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="z-50 bg-white border-b border-zinc-200 px-2 sm:px-4"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0 sm:justify-between h-auto min-h-14 py-2">
              {/* Logo */}
              <Link
                href="/"
                className="flex justify-center items-center space-x-2"
              >
                <Image
                  src="/logo.jpg"
                  alt="Seating4U Logo"
                  width={150}
                  height={80}
                />
              </Link>

              {/* Right Section - Now with better mobile layout */}
              <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-4">
                {/* Primary Actions Group */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={refreshSeats}
                    size="icon"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                  >
                    <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          className={`w-8 h-8 sm:w-10 sm:h-10 ${
                            showNames
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : ""
                          }`}
                          onClick={() => setShowNames(!showNames)}
                        >
                          <FolderPen className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {showNames ? "Hide booked names" : "Show booked names"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

      <FloorMapUploader />
              
                <WashupButton />


                {/* Secondary Actions Group */}
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center space-x-2">
                    <span className="text-sm font-medium">Full Screen</span>
                    <Switch
                      checked={isFullScreen}
                      onCheckedChange={handleFullScreenToggle}
                    />
                  </div>

                  <HelpButton />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
                        <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {/* Mobile-friendly action items */}
                      <DropdownMenuItem
                        onClick={() => setIsAssignGuestsDialogOpen(true)}
                      >
                        <UserCheck2 className="mr-2 w-4 h-4" /> Assign Multiple
                        Guests
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/seat-scanning"
                          className="flex items-center"
                        >
                          <ScanQrCode className="mr-2 w-4 h-4" /> Scan QR Code
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/scanner" className="flex items-center">
                          <Camera className="mr-2 w-4 h-4" /> Scanner
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/client-view" className="flex items-center">
                          <PersonStandingIcon className="mr-2 w-4 h-4" /> Client
                          View
                        </Link>
                      </DropdownMenuItem>
                      {session?.user?.email === "admin" && (
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/manage-users">
                            Manage Users
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Create New Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="px-2 sm:px-4 text-sm sm:text-base">
                        <span>New</span>
                        <ChevronDown className="h-4 w-4 ml-1 sm:ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setIsAddTableOpen(true)}
                      >
                        New Table
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={handleBulkTableCreation}
                      >
                        Bulk Create Tables
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setIsAddGuestOpen(true)}
                      >
                        New Guest
                      </DropdownMenuItem>
                      <ImportGuestsforWeb />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600"
                        onClick={() => setIsDeleteAllTablesDialogOpen(true)}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete All Tables
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Avatar Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10">
                        <AvatarImage
                          src="https://github.com/shadcn.png"
                          alt="@shadcn"
                        />
                        <AvatarFallback>JA</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="flex flex-col">
                      <ChangePasswordDialog />
                      <Button
                        variant="destructive"
                        onClick={handleSignOut}
                        className="mt-4"
                      >
                        Sign out
                      </Button>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
        {/* Main Content - Tables */}
        <motion.div
          layout
          className={`w-full ${
            isFullScreen ? "" : "lg:w-full xl:w-3/4"
          } bg-zinc-50 overflow-hidden`}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence>
            {!isFullScreen && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -50,
                }}
                transition={{ duration: 0.5 }}
                className="sticky top-0 z-40 bg-white border-b border-zinc-200 px-4 py-2 md:px-6 md:py-4"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="w-full md:w-auto">
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
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
                      <div className="bg-cyan-50 rounded-lg border border-cyan-200 p-2 text-center hover:shadow-sm transition-all">
                        <div className="text-xs uppercase tracking-wider text-cyan-600 mb-1">
                          Invited
                        </div>
                        <div className="text-lg font-bold text-cyan-800">
                          {totalGuests}
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg border border-red-200 p-2 text-center hover:shadow-sm transition-all">
                        <div className="text-xs uppercase tracking-wider text-red-600 mb-1">
                          Assigned
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
                  </div>
                  <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center space-x-2">
                      {" "}
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-zinc-200"></div>
                        <span className="text-sm text-zinc-600">Available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-200"></div>
                        <span className="text-sm text-zinc-600">Assigned</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-200"></div>
                        <span className="text-sm text-zinc-600">Arrived</span>
                      </div>
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
              className={`py-6 px-8 grid gap-12 sm:pb-[3rem] pb-[9rem]`}
              style={{
                gridTemplateColumns: isFullScreen
                  ? "repeat(4, minmax(0, 1fr))"
                  : "repeat(auto-fill, minmax(250px, 1fr))",
              }}
              transition={{ duration: 0.5 }}
            >
              {getVisibleTables().map((table, index) =>
                renderCircularTable(table, index)
              )}
            </motion.div>
          </ScrollArea>
        </motion.div>

        <AnimatePresence>
          {!isFullScreen && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="hidden xl:block w-1/4 bg-white overflow-hidden my-2 lg:my-0 lg:ml-2"
            >
              <BookingSidebar
                bookedSeats={bookedSeats}
                onDeleteBooking={handleDeleteBooking}
                onToggleReceived={handleToggleReceived}
                onDeleteAll={() => setIsDeleteAllDialogOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isFullScreen && (
        <div className="xl:hidden">
          <BookingSidebar
            bookedSeats={bookedSeats}
            onDeleteBooking={handleDeleteBooking}
            onToggleReceived={handleToggleReceived}
            onDeleteAll={() => setIsDeleteAllDialogOpen(true)}
          />
        </div>
      )}

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
        onTableAdded={refreshSeats}
        isOpen={isAddTableOpen}
        onClose={() => setIsAddTableOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Delete Table Dialog */}
      <PasswordVerificationDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
        }}
        onVerified={() => tableToDelete && handleDeleteTable(tableToDelete)}
        action="delete table"
        confirmText="Delete Table"
        confirmTextDisplay="Delete Table"
      />

      <BulkTableForm
        isOpen={isBulkTableDialogOpen}
        onClose={() => setBulkTableDialogOpen(false)}
        onSuccess={handleBulkTableSuccess}
      />

      <AddGuestForm
        isOpen={isAddGuestOpen}
        onClose={() => setIsAddGuestOpen(false)}
        onSuccess={() => {
          setIsAddGuestOpen(false);
          router.refresh();
        }}
      />

      <AssignGuestsDialog
        isOpen={isAssignGuestsDialogOpen}
        onClose={() => setIsAssignGuestsDialogOpen(false)}
        guests={allGuests || []}
        tables={getTableInfo()}
        onAssignGuests={handleAssignGuests}
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

      {/* Delete All Bookings Dialog */}
      <PasswordVerificationDialog
        open={isDeleteAllDialogOpen}
        onOpenChange={setIsDeleteAllDialogOpen}
        onVerified={handleDeleteAllBookings}
        action="delete all bookings"
        confirmText="Delete All Bookings"
        confirmTextDisplay="Delete All Bookings"
      />

      {/* Delete All Tables Dialog */}
      <PasswordVerificationDialog
        open={isDeleteAllTablesDialogOpen}
        onOpenChange={setIsDeleteAllTablesDialogOpen}
        onVerified={handleDeleteAllTables}
        action="delete all tables"
        confirmText="Delete All Tables"
        confirmTextDisplay="Delete All Tables"
      />

      {tableToEdit && (
        <EditTableDialog
          isOpen={isEditTableDialogOpen}
          onClose={() => {
            setIsEditTableDialogOpen(false);
            setTableToEdit(null);
          }}
          tableId={tableToEdit.id}
          currentName={tableToEdit.name}
          currentSeats={tableToEdit.seats}
          onSuccess={() => {
            refreshSeats();
            setTableToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default SeatBooking;
