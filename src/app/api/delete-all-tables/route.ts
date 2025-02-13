import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function DELETE() {
  try {
    // Delete all seats first
    await prisma.seat.deleteMany()

    // Then delete all tables
    await prisma.table.deleteMany()

    return NextResponse.json({ success: true, message: "All tables and seats deleted successfully" })
  } catch (error) {
    console.error("Error deleting all tables:", error)
    return NextResponse.json({ success: false, message: "Failed to delete all tables" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

