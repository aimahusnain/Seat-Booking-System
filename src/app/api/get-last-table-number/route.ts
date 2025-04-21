import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const tables = await db.table.findMany({
      orderBy: {
        name: "desc",
      },
      take: 1000,
    })

    let lastTableNumber = 0

    for (const table of tables) {
      const match = table.name.match(/Table (\d+)/)
      if (match) {
        const tableNumber = Number.parseInt(match[1], 10)
        if (tableNumber > lastTableNumber) {
          lastTableNumber = tableNumber
        }
      }
    }

    return NextResponse.json({ lastTableNumber })
  } catch (error) {
    console.error("Failed to fetch last table number:", error)
    return NextResponse.json({ error: "Failed to fetch last table number" }, { status: 500 })
  }
}

