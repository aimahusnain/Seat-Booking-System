"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Download } from "lucide-react";
import { FileUpload } from "./ui/file-upload";

export function ImportGuests({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const file = files[0]; // We'll process only the first file
      const data = await readFileData(file);
      const response = await fetch("/api/import-guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guests: data }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Imported ${result.importedCount} guests successfully`);
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

  const readFileData = (
    file: File
  ): Promise<{ firstname: string; lastname: string }[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        try {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          type GuestRow = { firstname?: string; lastname?: string; "First Name"?: string; "Last Name"?: string; "FirstName"?: string; "LastName"?: string };
          const formattedData = (jsonData as GuestRow[]).map((row) => {
            const firstname =
              row.firstname || row["First Name"] || row["FirstName"];
            const lastname =
              row.lastname || row["Last Name"] || row["LastName"];
            if (!firstname || !lastname) {
              throw new Error(
                "Invalid file format. Please use the correct column names."
              );
            }
            return { firstname, lastname };
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Guests</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
            <FileUpload onChange={handleFileUpload} />
          </div>{" "}
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
          {isLoading && <p>Importing guests...</p>}
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
