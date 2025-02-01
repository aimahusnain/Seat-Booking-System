"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGuests } from "../hooks/useGuests";
import { AddGuestForm } from "./add-guest-form";
import type { Person } from "../types/booking";
import { Search, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImportGuests } from "./import-guests";

interface PersonSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (person: Person) => void;
}

export function PersonSelector({
  isOpen,
  onClose,
  onSelect,
}: PersonSelectorProps) {
  const { guests, loading, error, mutate } = useGuests();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Person | null>(null);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading guests...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error loading guests</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const availableGuests = guests.filter((guest) => guest.seat.length === 0);

  const filteredGuests = availableGuests.filter((guest) =>
    `${guest.firstname} ${guest.lastname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleDeleteGuest = async (guest: Person) => {
    setGuestToDelete(guest);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteGuest = async () => {
    if (!guestToDelete) return;

    try {
      const response = await fetch(`/api/delete-guest`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guestId: guestToDelete.id }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Guest deleted successfully");
        mutate(); // Refresh the guests list
      } else {
        throw new Error(result.message || "Failed to delete guest");
      }
    } catch (error) {
      toast.error("Failed to delete guest", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
    setIsDeleteConfirmOpen(false);
    setGuestToDelete(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-start justify-center flex-col">
                <DialogTitle>Select a Person</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a person to assign to this seat
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ImportGuests onSuccess={() => mutate()} />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsAddGuestOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="relative mt-4">
            <Input
              type="text"
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <div className="grid gap-4 mt-4">
            {filteredGuests.length > 0 ? (
              filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="relative p-4 border rounded-lg hover:bg-gray-50 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div
                      className="flex-grow cursor-pointer"
                      onClick={() =>
                        onSelect({
                          id: guest.id,
                          firstName: guest.firstname,
                          lastName: guest.lastname,
                        })
                      }
                    >
                      <div className="font-medium text-lg flex items-center gap-2">
                        {guest.firstname} {guest.lastname}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDeleteGuest({
                          id: guest.id,
                          firstName: guest.firstname,
                          lastName: guest.lastname,
                        })
                      }
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No available guests found.</p>
                <p className="text-sm text-gray-400 mt-2">
                  All guests have been assigned seats or no guests match your
                  search.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddGuestForm
        isOpen={isAddGuestOpen}
        onClose={() => setIsAddGuestOpen(false)}
        onSuccess={() => {
          mutate(); // Refresh the guests list
        }}
      />

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-800">
              Delete Guest
            </DialogTitle>
            <DialogDescription className="mt-2">
              <div className="space-y-2">
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="font-medium text-red-700">
                    Are you sure you want to delete {guestToDelete?.firstName}{" "}
                    {guestToDelete?.lastName}?
                  </p>
                  <p className="text-red-600 text-sm mt-2">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteGuest}
              className="w-full sm:w-auto"
            >
              Delete Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
