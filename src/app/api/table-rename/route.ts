import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PATCH(req: Request) {
  try {
    const { tableId, newName } = await req.json()

    if (!tableId || !newName) {
      return NextResponse.json({ success: false, message: "Table ID and new name are required" }, { status: 400 })
    }

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { name: newName },
    })

    return NextResponse.json({ success: true, data: updatedTable })
  } catch (error) {
    console.error("Error updating table name:", error)
    return NextResponse.json({ success: false, message: "Failed to update table name" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
