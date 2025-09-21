import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { seatId } = await req.json()

    if (!seatId) {
      return NextResponse.json({ success: false, message: "Missing seatId" }, { status: 400 })
    }

    const updatedSeat = await db.seat.update({
      where: { id: seatId },
      data: { isReceived: true },
    })

    return NextResponse.json({ success: true, data: updatedSeat })
  } catch (error) {
    console.error("Error marking arrival:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
