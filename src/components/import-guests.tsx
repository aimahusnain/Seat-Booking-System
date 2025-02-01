"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { FileUpload } from "./ui/file-upload";

interface Guest {
  firstname: string;
  lastname: string;
}

export function ImportGuests({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
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
  
  console.log(`Importproress ${importProgress}`);
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (jobId) {
      intervalId = setInterval(checkJobStatus, 2000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId]);

  const checkJobStatus = async () => {
    if (!jobId) return;

    try {
      const response = await fetch(`/api/import-status/${jobId}`);
      const data = await response.json();

      if (data.status === "completed") {
        setJobId(null);
        setIsLoading(false);
        setImportStats(data.result);
        onSuccess();
      } else if (data.status === "failed") {
        setJobId(null);
        setIsLoading(false);
        setError(data.error);
      } else if (data.progress) {
        setImportProgress({
          current: data.progress.currentCount,
          total: data.progress.totalCount,
          success: data.progress.successCount,
          failure: data.progress.failureCount,
        });
      }
    } catch (error) {
      console.error("Error checking job status:", error);
    }
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
      const data = await readFileData(file);

      if (!data || data.length === 0) {
        throw new Error("No valid data found in the file");
      }

      const response = await fetch("/api/import-guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guests: data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setImportStats({
          imported: result.importedCount,
          total: result.totalProcessed,
          failedGuests: result.failedGuests,
          errors: result.errors || [],
        });
        toast.success(`Successfully imported ${result.importedCount} guests`);
        onSuccess();
      } else {
        throw new Error(result.message || "Failed to import guests");
      }
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Guests</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
            <FileUpload onChange={handleFileUpload} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => downloadSampleFile("xlsx")}
            >
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
              {importStats.failedGuests &&
                importStats.failedGuests.length > 0 && (
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
  );
}
