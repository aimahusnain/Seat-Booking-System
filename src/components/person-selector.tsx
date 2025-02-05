"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useGuests } from "../hooks/useGuests";
import { AddGuestForm } from "./add-guest-form";
import type { Person } from "../types/booking";
import { Search, UserPlus, Trash2, LoaderCircle } from "lucide-react";
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
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [isDeletingGuests, setIsDeletingGuests] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

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

  const handleCheckboxChange = (guestId: string) => {
    setSelectedGuests((prev) =>
      prev.includes(guestId)
        ? prev.filter((id) => id !== guestId)
        : [...prev, guestId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allGuestIds = filteredGuests.map((guest) => guest.id);
      setSelectedGuests(allGuestIds);
    } else {
      setSelectedGuests([]);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeletingGuests(true);
    setDeletedCount(0);

    try {
      const deletePromises = selectedGuests.map(async (guestId) => {
        const response = await fetch(`/api/delete-guest`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ guestId }),
        });
        const result = await response.json();

        if (result.success) {
          setDeletedCount((prev) => prev + 1);
        }
        return result;
      });

      const results = await Promise.all(deletePromises);
      const hasErrors = results.some((result) => !result.success);

      if (hasErrors) {
        toast.error("Some guests could not be deleted");
      } else {
        toast.success(`Successfully deleted ${selectedGuests.length} guests`);
        setSelectedGuests([]);
        mutate();
      }
    } catch (error) {
      toast.error("Failed to delete guests", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
    setIsDeletingGuests(false);
    setDeletedCount(0);
    setIsDeleteConfirmOpen(false);
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
                {selectedGuests.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete ({selectedGuests.length})</span>
                  </Button>
                )}
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

          {filteredGuests.length > 0 && (
            <div className="mt-4 mb-2 px-1">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={
                      selectedGuests.length === filteredGuests.length &&
                      filteredGuests.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    className="h-5 w-5"
                    id="select-all"
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Select All Guests
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  {selectedGuests.length} of {filteredGuests.length} selected
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-2 mt-2">
            {filteredGuests.length > 0 ? (
              filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="relative p-3 border rounded-lg hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <Checkbox
                        checked={selectedGuests.includes(guest.id)}
                        onCheckedChange={() => handleCheckboxChange(guest.id)}
                        className="h-4 w-4"
                        id={`guest-${guest.id}`}
                      />
                      <label
                        htmlFor={`guest-${guest.id}`}
                        className="flex-grow cursor-pointer py-1"
                        onClick={() =>
                          onSelect({
                            id: guest.id,
                            firstName: guest.firstname,
                            lastName: guest.lastname,
                          })
                        }
                      >
                        <div className="font-medium">
                          {guest.firstname} {guest.lastname}
                        </div>
                      </label>
                    </div>
                  </div>
                  <div
                    className={`absolute inset-0 border-2 rounded-lg transition-opacity pointer-events-none ${
                      selectedGuests.includes(guest.id)
                        ? "border-blue-500 opacity-100"
                        : "border-blue-500 opacity-0 group-hover:opacity-50"
                    }`}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
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
          mutate();
        }}
      />

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-800">
              Delete Selected Guests
            </DialogTitle>
            <DialogDescription className="mt-2">
              <div className="space-y-2">
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="font-medium text-red-700">
                    Are you sure you want to delete {selectedGuests.length}{" "}
                    selected guests?
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
              disabled={isDeletingGuests}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="w-full sm:w-auto"
              disabled={isDeletingGuests}
            >
              {isDeletingGuests ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">
                    <LoaderCircle />
                  </span>
                  Deleting ({deletedCount}/{selectedGuests.length})
                </span>
              ) : (
                "Delete Selected Guests"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
