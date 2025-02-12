import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name } = await req.json()

    // Split the name into parts
    const nameParts = name.toLowerCase().trim().split(/\s+/)

    // Search for user with either first name or last name matching any part
    const user = await db.users.findFirst({
      where: {
        OR: [
          {
            firstname: {
              contains: nameParts[0],
              mode: "insensitive",
            },
          },
          {
            lastname: {
              contains: nameParts[nameParts.length - 1],
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        seat: {
          include: {
            table: true,
            user: true, // Include user information
          },
        },
      },
    })

    if (!user || user.seat.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No seat booking found for this name",
      })
    }

    // Return the seat with user information
    const seatWithUser = {
      ...user.seat[0],
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
      },
    }

    return NextResponse.json({
      success: true,
      seat: seatWithUser,
    })
  } catch (error) {
    console.error("Search seat error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error searching for seat",
      },
      { status: 500 },
    )
  }
}

