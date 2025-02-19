// app/api/create-bulk-tables/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface CreateTableData {
  name: string;
  seats: number[];
}

export async function POST(req: Request) {
  try {
    const body: CreateTableData = await req.json()

    if (!body?.name || !Array.isArray(body?.seats)) {
      return NextResponse.json(
        { success: false, message: "Invalid input" }, 
        { status: 400 }
      )
    }

    const createdTable = await prisma.table.create({
      data: {
        name: body.name,
        Seat: {
          create: body.seats.map((seatNumber) => ({
            seat: seatNumber,
            isBooked: false,
            isReceived: false,
          })),
        },
      },
      include: {
        Seat: true,
      },
    })

    return NextResponse.json({ success: true, data: createdTable })
  } catch (error) {
    console.error("Error creating table:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create table" }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}