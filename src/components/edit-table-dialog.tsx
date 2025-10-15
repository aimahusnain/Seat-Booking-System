"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface EditTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string | number;
  currentName: string;
  currentSeats: number;
  onSuccess: () => void;
}

export function EditTableDialog({
  isOpen,
  onClose,
  tableId,
  currentName,
  currentSeats,
  onSuccess,
}: EditTableDialogProps) {
  const [newTableName, setNewTableName] = useState(currentName);
  const [newSeatsCount, setNewSeatsCount] = useState(currentSeats);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateTable = async () => {
    if (!newTableName.trim()) {
      toast.error("Please enter a valid table name");
      return;
    }

    if (newSeatsCount < 1 || newSeatsCount > 20) {
      toast.error("Please enter a valid number of seats (1-20)");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch("/api/table-update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId,
          newName: newTableName.trim(),
          newSeatsCount: newSeatsCount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        toast.success("Table updated successfully");
        onSuccess();
        onClose();
      } else {
        throw new Error(result.message || "Failed to update table");
      }
    } catch (error) {
      console.error("Update table error:", error);
      toast.error("Failed to update table", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setNewTableName(currentName);
          setNewSeatsCount(currentSeats);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-800">
            Edit Table
          </DialogTitle>
          <DialogDescription className="mt-2">
            Update the table name and number of seats.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="tableName" className="text-sm font-medium text-zinc-700">
              Table Name
            </Label>
            <Input
              id="tableName"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Enter table name"
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="seatsCount" className="text-sm font-medium text-zinc-700">
                Number of Seats
              </Label>
              <span className="text-2xl font-bold text-blue-600">
                {newSeatsCount}
              </span>
            </div>
            
            <Slider
              id="seatsCount"
              min={1}
              max={15}
              step={1}
              value={[newSeatsCount]}
              onValueChange={(value) => setNewSeatsCount(value[0])}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-zinc-500">
              <span>1 seat</span>
              <span>20 seats</span>
            </div>

            <p className="text-xs text-zinc-500 bg-zinc-50 p-2 rounded">
              {newSeatsCount > currentSeats
                ? `✨ Adding ${newSeatsCount - currentSeats} new seat(s)`
                : newSeatsCount < currentSeats
                ? `⚠️ Removing ${currentSeats - newSeatsCount} seat(s). Booked seats will be preserved.`
                : "✓ No change in seat count"}
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateTable}
            disabled={isUpdating || !newTableName.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? "Updating..." : "Update Table"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}