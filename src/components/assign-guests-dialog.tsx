"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Users } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Person {
  id: string
  firstName: string
  lastName: string
}

interface TableInfo {
  tableNumber: number
  availableSeats: number
  totalSeats: number
}

interface AssignGuestsDialogProps {
  isOpen: boolean
  onClose: () => void
  guests: Person[]
  tables: TableInfo[]
  onAssignGuests: (tableNumber: number, guestIds: string[]) => Promise<void>
}

export function AssignGuestsDialog({ isOpen, onClose, guests, tables, onAssignGuests }: AssignGuestsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const filteredGuests = guests.filter((guest) =>
    `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSelectGuest = (guestId: string) => {
    setSelectedGuests((prev) => {
      const next = new Set(prev)
      if (next.has(guestId)) {
        next.delete(guestId)
      } else {
        if (next.size >= 10) {
          toast.error("Maximum 10 guests can be selected at once")
          return prev
        }
        next.add(guestId)
      }
      return next
    })
  }

  const handleSelectTable = (tableNumber: number) => {
    setSelectedTable(tableNumber === selectedTable ? null : tableNumber)
  }

  const handleAssign = async () => {
    if (!selectedTable) {
      toast.error("Please select a table")
      return
    }

    if (selectedGuests.size === 0) {
      toast.error("Please select at least one guest")
      return
    }

    const selectedTableInfo = tables.find((t) => t.tableNumber === selectedTable)
    if (!selectedTableInfo) {
      toast.error("Selected table not found")
      return
    }

    if (selectedGuests.size > selectedTableInfo.availableSeats) {
      toast.error(`Table ${selectedTable} only has ${selectedTableInfo.availableSeats} seats available`)
      return
    }

    try {
      setIsLoading(true)
      await onAssignGuests(selectedTable, Array.from(selectedGuests))
      toast.success(`Successfully assigned ${selectedGuests.size} guests to Table ${selectedTable}`)
      setSelectedGuests(new Set())
      setSelectedTable(null)
      onClose()
    } catch (error) {
      toast.error("Failed to assign guests", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedGuests(new Set())
    setSelectedTable(null)
    setSearchQuery("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Assign Guests to Table</DialogTitle>
          <DialogDescription>
            Select up to 10 guests and a table to assign them to. The table must have enough available seats.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Guest Selection */}
          <div className="space-y-4">
            <div className="font-medium flex items-center justify-between">
              <span>Select Guests</span>
              <span className="text-sm text-muted-foreground">{selectedGuests.size}/10 selected</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-4 space-y-2">
                {filteredGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-md transition-colors",
                      selectedGuests.has(guest.id) ? "bg-accent" : "hover:bg-accent/50",
                    )}
                  >
                    <Checkbox
                      id={guest.id}
                      checked={selectedGuests.has(guest.id)}
                      onCheckedChange={() => handleSelectGuest(guest.id)}
                      disabled={!selectedGuests.has(guest.id) && selectedGuests.size >= 10}
                    />
                    <label htmlFor={guest.id} className="flex-1 text-sm cursor-pointer">
                      {guest.firstName} {guest.lastName}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Table Selection */}
          <div className="space-y-4">
            <div className="font-medium">Select Table</div>
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-4 grid gap-3">
                {tables.map((table) => (
                  <button
                    key={table.tableNumber}
                    onClick={() => handleSelectTable(table.tableNumber)}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 text-left transition-all",
                      selectedTable === table.tableNumber
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      table.availableSeats === 0 && "opacity-50 cursor-not-allowed",
                    )}
                    disabled={table.availableSeats === 0}
                  >
                    <div className="font-medium">Table {table.tableNumber}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {table.availableSeats} of {table.totalSeats} seats available
                    </div>
                    {selectedTable === table.tableNumber && selectedGuests.size > table.availableSeats && (
                      <div className="text-sm text-destructive mt-2">Not enough seats for selected guests</div>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              isLoading ||
              selectedGuests.size === 0 ||
              !selectedTable ||
              selectedGuests.size > (tables.find((t) => t.tableNumber === selectedTable)?.availableSeats || 0)
            }
          >
            {isLoading ? (
              "Assigning..."
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Assign {selectedGuests.size} Guest{selectedGuests.size !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

