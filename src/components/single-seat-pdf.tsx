import { Button } from "@/components/ui/button"
import { Printer } from 'lucide-react'
import type { Seat } from "@/types/booking"

interface PrintBookingProps {
  firstName: string
  lastName: string
  seats: Seat[] // Update to use the Seat type
}

const PrintableBooking = ({ firstName, lastName, seats }: PrintBookingProps) => {
  const handlePrint = () => {
    const printFrame = document.createElement("iframe")
    printFrame.style.position = "absolute"
    printFrame.style.top = "-9999px"
    document.body.appendChild(printFrame)

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
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              padding: 0;
            }
            .container {
              border: 8px solid black;
              padding: 40px;
              text-align: center;
              max-width: 400px;
              width: 100%;
            }
            .name {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 20px;
              color: black;
            }
            .seat {
              font-size: 24px;
              color: #000;
            }
            .table {
              font-size: 20px;
              color: #666;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="name">${firstName} ${lastName}</div>
            <div class="seat">Seat ${seats.map((seat) => seat.seat).join(", ")}</div>
          </div>
        </body>
      </html>
    `

    const frameDoc = printFrame.contentWindow?.document
    if (frameDoc) {
      frameDoc.write(printContent)
      frameDoc.close()

      printFrame.onload = () => {
        printFrame.contentWindow?.print()
        setTimeout(() => {
          document.body.removeChild(printFrame)
        }, 100)
      }
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handlePrint} className="text-gray-600 hover:text-blue-600 hover:bg-blue-50">
      <Printer className="h-4 w-4" />
    </Button>
  )
}

export default PrintableBooking
