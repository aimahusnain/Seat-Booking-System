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
import { Minus, Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"

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

  const generateTables = () => {
    const newTables: TableConfig[] = []
    for (let i = 0; i < tablesToCreate; i++) {
      newTables.push({
        tableNumber: startNumber + i,
        seats: defaultSeats,
      })
    }
    setTables(newTables)
  }

  const updateTableSeats = (index: number, value: number) => {
    if (value < 1 || value > 10) return

    setTables((prev) => prev.map((table, i) => (i === index ? { ...table, seats: value } : table)))
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
      setProgress({ current: 0, total: tables.length })
      const toastId = toast.loading(`Creating tables...`)

      for (const table of tables) {
        await fetch("/api/create-table", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(table),
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
                    max="10"
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
                        <TableHead>Seats</TableHead>
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
                                onClick={() => updateTableSeats(index, table.seats - 1)}
                                disabled={table.seats <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{table.seats}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateTableSeats(index, table.seats + 1)}
                                disabled={table.seats >= 10}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
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

