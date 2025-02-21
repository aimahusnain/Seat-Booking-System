import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Seat } from "@/types/booking";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  User
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import PasswordVerificationDialog from "./password-verification-dialog";
import PrintableBooking from "./single-seat-pdf";

interface BookingSidebarProps {
  bookedSeats: Seat[];
  onDeleteBooking: (seatId: string) => void;
  onToggleReceived: (seatId: string, isReceived: boolean) => void;
  onDeleteAll: () => void;
}

export function BookingSidebar({
  bookedSeats,
  onDeleteBooking,
  onToggleReceived,
  onDeleteAll,
}: BookingSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQueries, setSearchQueries] = useState({
    name: "",
    seat: "",
  });
  const isTablet = useMediaQuery("(min-width: 200px) and (max-width: 1279px)");

  // Delete booking dialog states
  const [isDeleteBookingDialogOpen, setIsDeleteBookingDialogOpen] =
    useState(false);
  const [deleteBookingPassword, setDeleteBookingPassword] = useState("");
  const [showDeleteBookingPassword, setShowDeleteBookingPassword] =
    useState(false);
  const [deleteBookingConfirmText, setDeleteBookingConfirmText] = useState("");
  const [seatToDelete, setSeatToDelete] = useState<string | null>(null);

  const handleDeleteBookingConfirm = async () => {
    try {
      if (seatToDelete) {
        onDeleteBooking(seatToDelete);
        setIsDeleteBookingDialogOpen(false);
        setDeleteBookingConfirmText("");
        setDeleteBookingPassword("");
        setSeatToDelete(null);
      }
    } catch (error) {
      console.log(error)
      toast.error("Delete Failed", {
        description: "An error occurred while processing your request",
      });
    }
  };

  // Move filtering logic to useMemo
  const filteredBookings = useMemo(() => {
    return bookedSeats.filter((seat) => {
      if (!searchQueries.name && !searchQueries.seat) return true;

      const fullName =
        `${seat.user?.firstname} ${seat.user?.lastname}`.toLowerCase();
      const nameMatch =
        !searchQueries.name ||
        fullName.includes(searchQueries.name.toLowerCase());
      const seatMatch =
        !searchQueries.seat ||
        seat.seat.toString().includes(searchQueries.seat);

      return nameMatch && seatMatch;
    });
  }, [bookedSeats, searchQueries]);

  // Memoized search input handlers
  const handleSearchChange =
    (field: "name" | "seat") => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQueries((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  // Memoized sidebar content
  const SidebarContent = useMemo(
    () => (
      <div className="flex flex-col h-full w-full bg-white">
        <div className="p-4 bg-white shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Booked Seats</h2>
            {bookedSeats.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteAll}
                className="text-xs"
              >
                Delete All
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQueries.name}
                onChange={handleSearchChange("name")}
                className="pl-8"
                autoComplete="off"
              />
            </div>
            <Input
              placeholder="Seat #"
              value={searchQueries.seat}
              onChange={handleSearchChange("seat")}
              className="w-20"
              autoComplete="off"
            />
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg truncate">
                        {seat.user?.firstname[0]}
                        {seat.user?.lastname[0]}
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3
                        className="text-sm font-semibold text-gray-900"
                        title={`${seat.user?.firstname} ${seat.user?.lastname}`}
                      >
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
                      <PrintableBooking
                        firstName={seat.user?.firstname || ""}
                        lastName={seat.user?.lastname || ""}
                        seats={[seat]}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSeatToDelete(seat.id);
                          setIsDeleteBookingDialogOpen(true);
                        }}
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
                {(searchQueries.name || searchQueries.seat) && (
                  <p className="text-xs text-gray-400 mt-1">
                    Try adjusting your search criteria
                  </p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <PasswordVerificationDialog
          open={isDeleteBookingDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteBookingDialogOpen(open);
            if (!open) {
              setDeleteBookingConfirmText("");
              setDeleteBookingPassword("");
              setShowDeleteBookingPassword(false);
              setSeatToDelete(null);
            }
          }}
        onVerified={handleDeleteBookingConfirm}
        action="delete booking"
        confirmText="Delete Booking"
        confirmTextDisplay="Delete Booking"
      />

        {/* Delete Booking Dialog */}
        {/* <Dialog
          open={isDeleteBookingDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteBookingDialogOpen(open);
            if (!open) {
              setDeleteBookingConfirmText("");
              setDeleteBookingPassword("");
              setShowDeleteBookingPassword(false);
              setSeatToDelete(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-800">
                Delete Booking
              </DialogTitle>
              <DialogDescription className="mt-2">
                <div className="space-y-2">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="font-medium text-red-700">
                      Are you sure you want to delete this booking?
                    </p>
                    <p className="text-red-600 text-sm mt-2">
                      This will permanently delete the booking. This action
                      cannot be undone.
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
                  Type &quot;<strong>Delete Booking</strong>&quot; to confirm
                </label>
                <Input
                  id="confirmText"
                  value={deleteBookingConfirmText}
                  onChange={(e) => setDeleteBookingConfirmText(e.target.value)}
                  placeholder="Delete Booking"
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
                    type={showDeleteBookingPassword ? "text" : "password"}
                    value={deleteBookingPassword}
                    onChange={(e) => setDeleteBookingPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowDeleteBookingPassword(!showDeleteBookingPassword)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showDeleteBookingPassword ? (
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
                onClick={() => setIsDeleteBookingDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteBookingConfirm}
                className="w-full sm:w-auto"
                disabled={
                  deleteBookingConfirmText !== "Delete Booking" ||
                  !deleteBookingPassword
                }
              >
                Delete Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog> */}
      </div>
    ),
    [
      bookedSeats,
      searchQueries,
      onDeleteBooking,
      onToggleReceived,
      onDeleteAll,
      filteredBookings,
      isDeleteBookingDialogOpen,
      deleteBookingConfirmText,
      deleteBookingPassword,
      showDeleteBookingPassword,
      seatToDelete,
    ]
  );

  if (isTablet) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
          >
            {isOpen ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
          {SidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-full h-full max-w-xs lg:max-w-sm xl:max-w-md">
      {SidebarContent}
    </div>
  );
}
