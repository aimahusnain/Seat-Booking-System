"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Guest {
  id: string
  firstname: string
  lastname: string
  seat: { id: string; tableId: string }[]
}

interface Table {
  id: string
  name: string
  seats: {
    id: string
    seat: number
    isBooked: boolean
  }[]
}

interface AssignGuestsDialogProps {
  isOpen: boolean
  onClose: () => void
  guests: Guest[]
  tables: Table[]
  onAssignGuests: (guestIds: string[], tableId: string) => Promise<void>
}

export function AssignGuestsDialog({ isOpen, onClose, guests, tables, onAssignGuests }: AssignGuestsDialogProps) {
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [isAssigning, setIsAssigning] = useState(false)

  const availableGuests = guests.filter((guest) => guest.seat.length === 0)
  const availableTables = tables.filter((table) => table.seats.some((seat) => !seat.isBooked))

  const handleGuestToggle = (guestId: string) => {
    setSelectedGuests((prev) => (prev.includes(guestId) ? prev.filter((id) => id !== guestId) : [...prev, guestId]))
  }

  const handleAssign = async () => {
    if (!selectedTable) {
      toast.error("Please select a table")
      return
    }

    if (selectedGuests.length === 0) {
      toast.error("Please select at least one guest")
      return
    }

    const selectedTableData = tables.find((t) => t.id === selectedTable)
    if (!selectedTableData) return

    const availableSeats = selectedTableData.seats.filter((seat) => !seat.isBooked).length

    if (selectedGuests.length > availableSeats) {
      toast.error(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Not enough seats available</div>
          <div className="text-sm">{selectedGuests.length - availableSeats} guest(s) cannot be assigned</div>
        </div>,
      )
      return
    }

    setIsAssigning(true)
    try {
      await onAssignGuests(selectedGuests, selectedTable)
      toast.success("Guests assigned successfully")
      setSelectedGuests([])
      setSelectedTable("")
      onClose()
    } catch (error) {
      console.log(error)
      toast.error("Failed to assign guests")
    } finally {
      setIsAssigning(false)
    }
  }

  const getTableAvailability = (table: Table) => {
    const totalSeats = table.seats.length
    const bookedSeats = table.seats.filter((seat) => seat.isBooked).length
    return `${totalSeats - bookedSeats} of ${totalSeats} seats available`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Assign Multiple Guests</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-4">
          {/* Left side - Guest selection */}
          <div className="space-y-4">
            <h3 className="font-semibold">Select Guests</h3>
            <ScrollArea className="h-[400px] border rounded-lg p-4">
              {availableGuests.length > 0 ? (
                availableGuests.map((guest) => (
                  <div key={guest.id} className="flex items-center space-x-3 py-2 px-2 hover:bg-muted rounded-lg">
                    <Checkbox
                      checked={selectedGuests.includes(guest.id)}
                      onCheckedChange={() => handleGuestToggle(guest.id)}
                    />
                    <Label className="cursor-pointer flex-1">
                      {guest.firstname} {guest.lastname}
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No available guests found</div>
              )}
            </ScrollArea>
            <div className="text-sm text-muted-foreground">{selectedGuests.length} guests selected</div>
          </div>

          {/* Right side - Table selection */}
          <div className="space-y-4">
            <h3 className="font-semibold">Select Table</h3>
            <ScrollArea className="h-[400px] border rounded-lg p-4">
              <RadioGroup value={selectedTable} onValueChange={setSelectedTable}>
                {availableTables.map((table) => (
                  <div key={table.id} className="flex items-center space-x-3 py-2 px-2 hover:bg-muted rounded-lg">
                    <RadioGroupItem value={table.id} id={table.id} />
                    <Label htmlFor={table.id} className="flex-1">
                      <div className="flex justify-between items-center">
                        <span>{table.name}</span>
                        <span className="text-sm text-muted-foreground">{getTableAvailability(table)}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </ScrollArea>
          </div>
        </div>

        {selectedGuests.length > 0 && selectedTable && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Selected guests will be assigned to the first available seats at the table.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isAssigning || !selectedTable || selectedGuests.length === 0}>
            {isAssigning ? "Assigning..." : "Assign Guests"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

