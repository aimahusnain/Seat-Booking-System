// app/components/bulk-table-form.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"

interface BulkTableFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface TableConfig {
  tableNumber: number
  seats: number[]
  numberOfSeats: number
}

export function BulkTableForm({ isOpen, onClose, onSuccess }: BulkTableFormProps) {
  const [tables, setTables] = useState<TableConfig[]>([])
  const [startNumber, setStartNumber] = useState(0)
  const [tablesToCreate, setTablesToCreate] = useState(1)
  const [defaultSeats, setDefaultSeats] = useState(8)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [isLoadingStartNumber, setIsLoadingStartNumber] = useState(true)

  const fetchLastTableNumber = async () => {
    setIsLoadingStartNumber(true)
    try {
      const response = await fetch("/api/get-last-table-number")
      const data = await response.json()
      setStartNumber(data.lastTableNumber + 1)
    } catch (error) {
      console.error("Failed to fetch last table number:", error)
      toast.error("Failed to fetch last table number")
    } finally {
      setIsLoadingStartNumber(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchLastTableNumber()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isLoadingStartNumber) {
      generateTables()
    }
  }, [isLoadingStartNumber, tablesToCreate, defaultSeats])

  const updateTableSeats = (tableNumber: number, newSeatCount: number) => {
    setTables(prevTables => 
      prevTables.map(table => {
        if (table.tableNumber === tableNumber) {
          const seats = Array.from({ length: newSeatCount }, (_, seatIndex) =>
            Number.parseInt(`${tableNumber}${(seatIndex + 1).toString().padStart(2, "0")}`)
          )
          return { ...table, seats, numberOfSeats: newSeatCount }
        }
        return table
      })
    )
  }

  const generateTables = () => {
    const newTables: TableConfig[] = []
    for (let i = 0; i < tablesToCreate; i++) {
      const tableNumber = startNumber + i
      const seats = Array.from({ length: defaultSeats }, (_, seatIndex) =>
        Number.parseInt(`${tableNumber}${(seatIndex + 1).toString().padStart(2, "0")}`)
      )
      newTables.push({
        tableNumber,
        seats,
        numberOfSeats: defaultSeats
      })
    }
    setTables(newTables)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (tables.length === 0) {
      toast.error("Please generate tables first")
      return
    }

    try {
      setIsLoading(true)
      setProgress({ current: 0, total: tables.length })
      const toastId = toast.loading(`Creating tables...`)

      for (const table of tables) {
        await fetch("/api/create-bulk-tables", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `Table ${table.tableNumber}`,
            seats: table.seats,
          }),
        })

        setProgress((prev) => ({ ...prev, current: prev.current + 1 }))
        toast.loading(`Creating tables...`, { id: toastId })
      }

      toast.success(`Successfully created ${tables.length} tables`, { id: toastId })
      onSuccess()
      onClose()
      setTables([])
      setTablesToCreate(1)
    } catch (error) {
      toast.error("Failed to create tables", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create Multiple Tables</DialogTitle>
          <DialogDescription>Customize the number of tables and seats to create.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tablesToCreate">Number of Tables</Label>
                  <Input
                    id="tablesToCreate"
                    type="number"
                    value={tablesToCreate}
                    onChange={(e) => setTablesToCreate(Number(e.target.value))}
                    min="1"
                    max="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultSeats">Default Seats per Table</Label>
                  <Input
                    id="defaultSeats"
                    type="number"
                    value={defaultSeats}
                    onChange={(e) => setDefaultSeats(Number(e.target.value))}
                    min="1"
                    max="15"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {tables.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px] rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Table No.</TableHead>
                        <TableHead className="w-[150px]">Seats Count</TableHead>
                        <TableHead>Seat Numbers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tables.map((table) => (
                        <TableRow key={table.tableNumber}>
                          <TableCell className="font-medium">Table {table.tableNumber}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={table.numberOfSeats}
                              onChange={(e) => updateTableSeats(table.tableNumber, Number(e.target.value))}
                              min="1"
                              max="15"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {table.seats.map((seatNumber, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                                  {seatNumber}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || tables.length === 0}>
            {isLoading ? `Creating... (${progress.current}/${progress.total})` : "Create Tables"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}