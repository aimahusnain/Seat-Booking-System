"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface AddTableFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddTableForm({
  isOpen,
  onClose,
  onSuccess,
}: AddTableFormProps) {
  const [tableName, setTableName] = useState("");
  const [seatNumbers, setSeatNumbers] = useState<string[]>(Array(10).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/add-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tableName,
          seats: seatNumbers.map((num) => Number.parseInt(num)),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Table added successfully");
        onSuccess();
        onClose();
        setTableName("");
        setSeatNumbers(Array(10).fill(""));
      } else {
        throw new Error(data.message || "Failed to add table");
      }
    } catch (error) {
      toast.error("Failed to add table", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeatNumberChange = (index: number, value: string) => {
    const newSeatNumbers = [...seatNumbers];
    newSeatNumbers[index] = value;
    setSeatNumbers(newSeatNumbers);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Add New Table
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="relative w-[500px] h-[500px] mx-auto">
            {/* Center Input for Table Name */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-32">
              <Input
                placeholder="Table Name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="text-center bg-white shadow-lg border-2 border-indigo-200"
                required
              />
            </div>

            {/* Circular Seat Number Inputs */}
            {seatNumbers.map((seatNumber, index) => {
              const angle = ((index - 2.5) * 2 * Math.PI) / 10;
              const radius = 180;
              const left = Math.cos(angle) * radius + 225;
              const top = Math.sin(angle) * radius + 225;

              return (
                <motion.div
                  key={index}
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
                  <Input
                    type="number"
                    placeholder={`Seat ${index + 1}`}
                    value={seatNumber}
                    onChange={(e) =>
                      handleSeatNumberChange(index, e.target.value)
                    }
                    className="w-20 overflow-y-hidden h-16 rounded-full text-center bg-white shadow-md border-2 border-indigo-200"
                    required
                    min="1"
                  />
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="hover:bg-red-50 hover:text-red-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? "Adding..." : "Add Table"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
