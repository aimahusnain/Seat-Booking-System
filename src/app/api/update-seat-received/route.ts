import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { seatId, isReceived } = body

    const updatedSeat = await db.seat.update({
      where: {
        id: seatId,
      },
      data: {
        isReceived: isReceived, // Changed from isRecieved to isReceived
      },
      include: {
        table: true,
        user: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedSeat,
    })
  } catch (error) {
    console.error("Error updating seat received status:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update seat received status",
      },
      { status: 500 },
    )
  }
}

