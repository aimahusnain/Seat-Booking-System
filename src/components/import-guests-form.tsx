"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { FileUpload } from "./ui/file-upload";

interface Guest {
  firstname: string;
  lastname: string;
}

export function ImportGuestsforWeb() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    success: number;
    failure: number;
  } | null>(null);
  const [importStats, setImportStats] = useState<{
    imported: number;
    total: number;
    failedGuests: Guest[];
    errors: string[];
  } | null>(null);

  const addGuest = async (guest: Guest) => {
    const response = await fetch("/api/add-guest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(guest),
    });

    if (!response.ok) {
      throw new Error(`Failed to add guest: ${response.statusText}`);
    }

    return response.json();
  };

  const handleFileUpload = async (files: File[]) => {
    if (!files || files.length === 0) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    setError(null);
    setImportProgress(null);
    setImportStats(null);

    try {
      const file = files[0];
      const guests = await readFileData(file);

      if (!guests || guests.length === 0) {
        throw new Error("No valid data found in the file");
      }

      const importedGuests: Guest[] = [];
      const failedGuests: Guest[] = [];
      const errors: string[] = [];

      for (let i = 0; i < guests.length; i++) {
        const guest = guests[i];
        try {
          await addGuest(guest);
          importedGuests.push(guest);
        } catch (error) {
          failedGuests.push(guest);
          errors.push(
            `Failed to add guest ${guest.firstname} ${guest.lastname}: ${error}`
          );
        }

        setImportProgress({
          current: i + 1,
          total: guests.length,
          success: importedGuests.length,
          failure: failedGuests.length,
        });
      }

      setImportStats({
        imported: importedGuests.length,
        total: guests.length,
        failedGuests,
        errors,
      });

      toast.success(
        `Successfully imported ${importedGuests.length} out of ${guests.length} guests`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      toast.error("Failed to import guests", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const readFileData = (file: File): Promise<Guest[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        try {
          if (!data) {
            throw new Error("No file data found");
          }

          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          if (!Array.isArray(jsonData)) {
            throw new Error("Invalid file format");
          }

          const formattedData = (
            jsonData as Array<Record<string, string | number>>
          ).map((row) => {
            const firstname =
              row.firstname || row["First Name"] || row["FirstName"];
            const lastname =
              row.lastname || row["Last Name"] || row["LastName"];

            if (!firstname || !lastname) {
              throw new Error(
                "Invalid file format. Please use the correct column names: firstname, lastname"
              );
            }

            return {
              firstname: String(firstname).trim(),
              lastname: String(lastname).trim(),
            };
          });

          resolve(formattedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const downloadSampleFile = (fileType: "xlsx" | "csv") => {
    const data = [
      { firstname: "John", lastname: "Doe" },
      { firstname: "Jane", lastname: "Smith" },
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Guests");

    if (fileType === "xlsx") {
      XLSX.writeFile(wb, "sample_guests.xlsx");
    } else {
      XLSX.writeFile(wb, "sample_guests.csv");
    }
  };

  // const removeDuplicates = async () => {
  //   try {
  //     setIsLoading(true);
  //     const response = await fetch("/api/remove-duplicates", {
  //       method: "POST",
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to remove duplicates");
  //     }

  //     const data = await response.json();
  //     toast.success(
  //       `Successfully removed ${data.removedCount} duplicate users`
  //     );
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : "Unknown error occurred";
  //     toast.error("Failed to remove duplicates", { description: errorMessage });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full !justify-start p-2">
          Import Guests
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Import Guests</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
            <FileUpload onChange={handleFileUpload} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex justify-between items-center w-full gap-2">
              <Button
                variant="outline"
                onClick={() => downloadSampleFile("xlsx")}
              >
                <Download className="h-4 w-4 mr-2" />
                XLSX Sample
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadSampleFile("csv")}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV Sample
              </Button>
            </div>
            {/* <Button
              variant="destructive"
              onClick={removeDuplicates}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Duplicates
            </Button> */}
          </div>
          {isLoading && importProgress && (
            <div className="text-center">
              <p>Importing guests...</p>
              <Progress
                value={(importProgress.current / importProgress.total) * 100}
                className="mt-2"
              />
              <p className="text-sm mt-1">
                Processed: {importProgress.current} / {importProgress.total}{" "}
                (Success: {importProgress.success}, Failure:{" "}
                {importProgress.failure})
              </p>
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
                Imported {importStats.imported} out of {importStats.total}{" "}
                guests
              </p>
              {importStats.failedGuests.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-red-600 font-medium">
                    Failed to import:
                  </p>
                  <ul className="text-sm text-red-600 list-disc list-inside max-h-40 overflow-y-auto">
                    {importStats.failedGuests.map((guest, index) => (
                      <li key={index}>
                        {guest.firstname} {guest.lastname}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {importStats.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-red-600 font-medium">Errors:</p>
                  <ul className="text-sm text-red-600 list-disc list-inside max-h-40 overflow-y-auto">
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
  );
}
