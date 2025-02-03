import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { name, seats } = await request.json()

    // Create the table
    const table = await prisma.table.create({
      data: {
        name,
        Seat: {
          create: seats.map((seatNumber: number) => ({
            seat: seatNumber,
            isBooked: false,
            isReceived: false,
          })),
        },
      },
    })

    return NextResponse.json({ success: true, data: table })
  } catch (error) {
    console.error("Failed to add table:", error)
    return NextResponse.json({ success: false, message: "Failed to add table" }, { status: 500 })
  }
}

