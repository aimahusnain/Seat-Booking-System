"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Minus, Plus, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"


interface BulkTableFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface TableConfig {
  tableNumber: number
  seats: number
}

export function BulkTableForm({ isOpen, onClose, onSuccess }: BulkTableFormProps) {
  const [tables, setTables] = useState<TableConfig[]>([])
  const [startNumber, setStartNumber] = useState("")
  const [endNumber, setEndNumber] = useState("")
  const [defaultSeats, setDefaultSeats] = useState("8")
  const [isLoading, setIsLoading] = useState(false)

  const generateTables = () => {
    const start = Number.parseInt(startNumber)
    const end = Number.parseInt(endNumber)

    if (isNaN(start) || isNaN(end)) {
      toast.error("Please enter valid numbers")
      return
    }

    if (start >= end) {
      toast.error("Start number must be less than end number")
      return
    }

    const newTables: TableConfig[] = []
    for (let i = start; i <= end; i++) {
      newTables.push({
        tableNumber: i,
        seats: Number.parseInt(defaultSeats) || 8,
      })
    }
    setTables(newTables)
  }

  const updateTableSeats = (index: number, value: string) => {
    const seats = Number.parseInt(value)
    if (isNaN(seats) || seats < 1) return

    setTables((prev) => prev.map((table, i) => (i === index ? { ...table, seats } : table)))
  }

  const removeTable = (index: number) => {
    setTables((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (tables.length === 0) {
      toast.error("Please generate tables first")
      return
    }

    if (tables.some((table) => table.seats < 1)) {
      toast.error("All tables must have at least 1 seat")
      return
    }

    try {
      setIsLoading(true)
      const toastId = toast.loading(`Creating ${tables.length} tables...`)

      const response = await fetch("/api/create-bulk-tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tables }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Successfully created ${tables.length} tables`, { id: toastId })
        onSuccess()
        onClose()
        setTables([])
        setStartNumber("")
        setEndNumber("")
      } else {
        throw new Error(data.message || "Failed to create tables")
      }
    } catch (error) {
      toast.error("Failed to create tables", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create Multiple Tables</DialogTitle>
          <DialogDescription>
            Generate tables and customize the number of seats for each table.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Table Generation Controls */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startNumber">Start Number</Label>
              <Input
                id="startNumber"
                type="number"
                value={startNumber}
                onChange={(e) => setStartNumber(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endNumber">End Number</Label>
              <Input
                id="endNumber"
                type="number"
                value={endNumber}
                onChange={(e) => setEndNumber(e.target.value)}
                placeholder="10"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultSeats">Default Seats</Label>
              <Input
                id="defaultSeats"
                type="number"
                value={defaultSeats}
                onChange={(e) => setDefaultSeats(e.target.value)}
                placeholder="8"
                max={10}
                min="1"
              />
            </div>
          </div>

          <Button type="button" onClick={generateTables} className="w-full">
            Generate Tables
          </Button>

          {/* Tables Configuration */}
          {tables.length > 0 && (
            <ScrollArea className="h-[300px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Table No.</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table, index) => (
                    <TableRow key={table.tableNumber}>
                      <TableCell className="font-medium">Table {table.tableNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateTableSeats(index, (table.seats - 1).toString())}
                            disabled={table.seats <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={table.seats}
                            onChange={(e) => updateTableSeats(index, e.target.value)}
                            className="w-20 text-center"
                            max={10}
                            min="1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={table.seats >= 10}
                            onClick={() => updateTableSeats(index, (table.seats + 1).toString())}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeTable(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || tables.length === 0}>
            {isLoading ? "Creating..." : "Create Tables"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

