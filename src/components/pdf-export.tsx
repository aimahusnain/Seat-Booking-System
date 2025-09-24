"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { Seat } from "../types/booking";

interface PDFExportProps {
  bookedSeats: Seat[];
}

export const PDFExport = forwardRef<
  { generatePDF: () => void },
  PDFExportProps
>(({ bookedSeats }, ref) => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const generatePDF = () => {
    const input = pdfRef.current;
    if (!input) return;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4", true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      // Add captured content
      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // Add footer text at bottom center
      pdf.setFontSize(10);
      pdf.text("www.seating4u.com", pdfWidth / 2, pdfHeight - 10, {
        align: "center",
      });

      pdf.save("seat-bookings.pdf");
    });
  };

  useImperativeHandle(ref, () => ({
    generatePDF,
  }));

  return (
    <div className="hidden">
      <div ref={pdfRef} className="p-4 bg-white">
        <h1 className="text-2xl font-bold mb-4">Seat Bookings</h1>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Table</th>
              <th className="border p-2">Seat</th>
              <th className="border p-2">Booked By</th>
            </tr>
          </thead>
          <tbody>
            {bookedSeats.map((seat) => (
              <tr key={seat.id}>
                <td className="border p-2">{seat.tableNumber}</td>
                <td className="border p-2">{seat.seatNumber}</td>
                <td className="border p-2">
                  {/* {seat.bookedBy?.firstName} {seat.bookedBy?.lastName} */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

PDFExport.displayName = "PDFExport";
