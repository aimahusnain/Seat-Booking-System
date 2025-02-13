import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: {
        Seat: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({ success: true, data: tables })
  } catch (error) {
    console.error("Error fetching tables:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch tables" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}