// app/api/get-seat-checkin/route.ts
import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const seatId = req.nextUrl.searchParams.get("seatId")
    
    if (!seatId) {
      return NextResponse.json(
        {
          success: false,
          message: "Seat ID is required",
        },
        { status: 400 },
      )
    }
    const seat = await db.seat.findUnique({
      where: {
        id: seatId,
      },
      include: {
        table: {
          select: {
            id: true,
            name: true,
            notes: true, // Add this line
          }
        },
        user: true,
      },
    })
    if (!seat) {
      return NextResponse.json(
        {
          success: false,
          message: "Seat not found",
        },
        { status: 404 },
      )
    }
    return NextResponse.json({
      success: true,
      data: seat,
    })
  } catch (error) {
    console.error("Error fetching seat:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch seat information",
      },
      { status: 500 },
    )
  }
}