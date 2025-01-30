import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintBookingProps {
  firstName: string;
  lastName: string;
  seats: Array<{
    id: string;
    tableNumber: number;
    seatNumber: number;
  }>;
}

const PrintableBooking = ({ firstName, lastName, seats }: PrintBookingProps) => {
  const handlePrint = () => {
    // Create a hidden iframe for printing
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-9999px';
    document.body.appendChild(printFrame);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Booking Details - ${firstName} ${lastName}</title>
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 700px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2563eb;
            }
            .header h1 {
              color: #2563eb;
              font-size: 28px;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .booking-details {
              background-color: #f8fafc;
              border-radius: 10px;
              padding: 20px;
              margin-bottom: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .booking-details h2 {
              color: #1e40af;
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            .booking-details p {
              color: #64748b;
              font-size: 16px;
              margin: 0;
            }
            .seats-list {
              background: white;
              border: 2px solid #e2e8f0;
              border-radius: 10px;
              padding: 20px;
            }
            .seats-list h3 {
              color: #1e40af;
              margin: 0 0 20px 0;
              font-size: 20px;
            }
            .seats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
              gap: 15px;
            }
            .seat-item {
              background-color: #f1f5f9;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              font-size: 16px;
              color: #334155;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }
            .seat-number {
              font-weight: bold;
              color: #2563eb;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #64748b;
              font-size: 14px;
            }
            .footer p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Details</h1>
            </div>
            
            <div class="booking-details">
              <h2>${firstName} ${lastName}</h2>
              <p>Total Seats Reserved: ${seats.length}</p>
            </div>
            
            <div class="seats-list">
              <h3>Reserved Seats</h3>
              <div class="seats-grid">
                ${seats
                  .map(
                    (seat) => `
                  <div class="seat-item">
                    <span class="seat-number">Seat ${seat.seatNumber}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
            
            <div class="footer">
              <p>Generated on ${new Date().toLocaleDateString()}</p>
              <p>Please keep this document for your records</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Write content to iframe and print
    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.write(printContent);
      frameDoc.close();
      
      // Wait for content to load before printing
      printFrame.onload = () => {
        printFrame.contentWindow?.print();
        // Remove the iframe after printing
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 100);
      };
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handlePrint}
      className="bg-blue-100 hover:text-blue-600"
    >
      <Printer className="h-4 w-4" />
    </Button>
  );
};

export default PrintableBooking;