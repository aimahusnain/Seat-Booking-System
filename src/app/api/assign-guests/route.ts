import { NextResponse } from "next/server"
import {db} from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { guestIds, tableId } = await req.json()

    // Get all available seats for the table
    const availableSeats = await db.seat.findMany({
      where: {
        tableId: tableId,
        isBooked: false,
      },
      orderBy: {
        seat: "asc",
      },
    })

    if (availableSeats.length < guestIds.length) {
      return NextResponse.json({ success: false, message: "Not enough available seats" }, { status: 400 })
    }

    // Assign guests to seats
    const assignments = guestIds.map((guestId: string, index: number) => {
      return db.seat.update({
        where: { id: availableSeats[index].id },
        data: {
          isBooked: true,
          userId: guestId,
        },
      })
    })

    await db.$transaction(assignments)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error assigning guests:", error)
    return NextResponse.json({ success: false, message: "Failed to assign guests" }, { status: 500 })
  }
}

