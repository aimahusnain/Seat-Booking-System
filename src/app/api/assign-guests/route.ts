import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { tableNumber, guestIds } = await req.json()

    if (!tableNumber || !Array.isArray(guestIds) || guestIds.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 })
    }

    // Use a transaction for the entire operation
    const result = await prisma.$transaction(
      async (tx) => {
        // Find available seats at the table
        const table = await tx.table.findFirst({
          where: { name: `Table${tableNumber}` },
          include: {
            Seat: {
              where: { isBooked: false },
              orderBy: { seat: "asc" },
            },
          },
        })

        if (!table) {
          throw new Error("Table not found")
        }

        if (table.Seat.length < guestIds.length) {
          throw new Error(
            `Not enough seats available. Table ${tableNumber} has ${table.Seat.length} seats available but trying to assign ${guestIds.length} guests`,
          )
        }

        // Assign guests to seats
        const assignments = await Promise.all(
          guestIds.map((guestId, index) =>
            tx.seat.update({
              where: { id: table.Seat[index].id },
              data: {
                isBooked: true,
                userId: guestId,
              },
              include: {
                user: true,
                table: true,
              },
            }),
          ),
        )

        return assignments
      },
      {
        timeout: 10000, // 10 second timeout
        maxWait: 5000, // Maximum time to wait for transaction to start
      },
    )

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully assigned ${guestIds.length} guests to Table ${tableNumber}`,
    })
  } catch (error) {
    console.error("Error assigning guests:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to assign guests",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

