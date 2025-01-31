import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { guests } = await request.json()

    const importedGuests = await prisma.$transaction(async (tx) => {
      const importedGuests = []

      for (const guest of guests) {
        const existingGuest = await tx.users.findFirst({
          where: {
            firstname: guest.firstname,
            lastname: guest.lastname,
          },
        })

        if (!existingGuest) {
          const newGuest = await tx.users.create({
            data: {
              firstname: guest.firstname,
              lastname: guest.lastname,
            },
          })
          importedGuests.push(newGuest)
        }
      }

      return importedGuests
    })

    return NextResponse.json({ success: true, importedCount: importedGuests.length })
  } catch (error) {
    console.error("Error importing guests:", error)
    return NextResponse.json({ success: false, message: "Failed to import guests" }, { status: 500 })
  }
}

