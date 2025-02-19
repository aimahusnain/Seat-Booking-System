import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const guests = await prisma.users.findMany({
      select: {
        id: true,
        firstname: true,
        lastname: true,
      },
      orderBy: {
        firstname: "asc",
      },
    })

    const formattedGuests = guests.map((guest) => ({
      id: guest.id,
      firstName: guest.firstname,
      lastName: guest.lastname,
    }))

    return NextResponse.json({
      success: true,
      data: formattedGuests,
    })
  } catch (error) {
    console.error("Error fetching guests:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch guests",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

