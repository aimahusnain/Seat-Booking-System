"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { FileUpload } from "./ui/file-upload"
import { Progress } from "@/components/ui/progress"

interface Guest {
  firstname: string
  lastname: string
}

export function ImportGuests({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState<{
    current: number
    total: number
    duplicates: number
  } | null>(null)
  const [importStats, setImportStats] = useState<{
    imported: number
    total: number
    duplicates: number
    failedGuests?: Guest[]
    duplicateGuests?: Guest[]
    errors?: string[]
  } | null>(null)

  const handleFileUpload = async (files: File[]) => {
    if (!files || files.length === 0) {
      toast.error("Please select a file to upload")
      return
    }

    setIsLoading(true)
    setError(null)
    setImportProgress(null)
    setImportStats(null)

    try {
      const file = files[0]
      const data = await readFileData(file)

      if (!data || data.length === 0) {
        throw new Error("No valid data found in the file")
      }

      const response = await fetch("/api/import-guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guests: data }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setImportStats({
          imported: result.importedCount,
          total: result.totalProcessed,
          duplicates: result.duplicateCount,
          failedGuests: result.failedGuests,
          duplicateGuests: result.duplicateGuests,
          errors: result.errors,
        })

        if (result.importedCount > 0) {
          toast.success(`Imported ${result.importedCount} out of ${result.totalProcessed} guests successfully`)
          onSuccess()
        } else {
          toast.warning("No new guests were imported (possible duplicates)")
        }
      } else {
        throw new Error(result.message || "Failed to import guests")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      toast.error("Failed to import guests", { description: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const readFileData = (file: File): Promise<Guest[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result
        try {
          if (!data) {
            throw new Error("No file data found")
          }

          const workbook = XLSX.read(data, { type: "binary" })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(sheet)

          if (!Array.isArray(jsonData)) {
            throw new Error("Invalid file format")
          }

          const formattedData = jsonData.map((row: any) => {
            const firstname = row.firstname || row["First Name"] || row["FirstName"]
            const lastname = row.lastname || row["Last Name"] || row["LastName"]

            if (!firstname || !lastname) {
              throw new Error("Invalid file format. Please use the correct column names: firstname, lastname")
            }

            return {
              firstname: String(firstname).trim(),
              lastname: String(lastname).trim(),
            }
          })

          resolve(formattedData)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = (error) => reject(error)
      reader.readAsBinaryString(file)
    })
  }

  const downloadSampleFile = (fileType: "xlsx" | "csv") => {
    const data = [
      { firstname: "John", lastname: "Doe" },
      { firstname: "Jane", lastname: "Smith" },
    ]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Guests")

    if (fileType === "xlsx") {
      XLSX.writeFile(wb, "sample_guests.xlsx")
    } else {
      XLSX.writeFile(wb, "sample_guests.csv")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Import Guests</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
            <FileUpload onChange={handleFileUpload} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" onClick={() => downloadSampleFile("xlsx")}>
              <Download className="h-4 w-4 mr-2" />
              XLSX Sample
            </Button>
            <Button variant="outline" onClick={() => downloadSampleFile("csv")}>
              <Download className="h-4 w-4 mr-2" />
              CSV Sample
            </Button>
          </div>
          {isLoading && (
            <div className="text-center">
              <p>Importing guests...</p>
              {importProgress && (
                <div className="mt-2">
                  <Progress value={(importProgress.current / importProgress.total) * 100} />
                  <p className="text-sm mt-1">
                    Processed: {importProgress.current} / {importProgress.total}
                    {importProgress.duplicates > 0 && ` (${importProgress.duplicates} duplicates)`}
                  </p>
                </div>
              )}
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-red-500">{error}</p>
            </div>
          )}
          {importStats && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="font-medium">
                Imported {importStats.imported} out of {importStats.total} guests
              </p>
              <p className="text-sm text-gray-600">Duplicates: {importStats.duplicates}</p>
              {importStats.duplicateGuests && importStats.duplicateGuests.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-yellow-600 font-medium">Duplicate guests:</p>
                  <ul className="text-sm text-yellow-600 list-disc list-inside max-h-40 overflow-y-auto">
                    {importStats.duplicateGuests.map((guest, index) => (
                      <li key={index}>
                        {guest.firstname} {guest.lastname}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {importStats.failedGuests && importStats.failedGuests.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-red-600 font-medium">Failed to import:</p>
                  <ul className="text-sm text-red-600 list-disc list-inside max-h-40 overflow-y-auto">
                    {importStats.failedGuests.map((guest, index) => (
                      <li key={index}>
                        {guest.firstname} {guest.lastname}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {importStats.errors && importStats.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-red-600 font-medium">Errors:</p>
                  <ul className="text-sm text-red-600 list-disc list-inside">
                    {importStats.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

