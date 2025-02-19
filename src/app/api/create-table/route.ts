import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { tableNumber, seats } = await req.json()

    if (!tableNumber || !seats || seats < 1 || seats > 10) {
      return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 })
    }

    const table = await prisma.table.create({
      data: {
        name: `Table${tableNumber}`,
        Seat: {
          create: Array.from({ length: seats }, (_, index) => ({
            seat: index + 1,
            isBooked: false,
            isReceived: false,
          })),
        },
      },
      include: {
        Seat: true,
      },
    })

    return NextResponse.json({ success: true, data: table })
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
