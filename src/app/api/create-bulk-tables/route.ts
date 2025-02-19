import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { tables } = await req.json()

    // Validate input
    if (!Array.isArray(tables) || tables.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid or empty tables configuration" }, { status: 400 })
    }

    // Create tables and seats with an increased timeout and batch processing
    const result = await prisma.$transaction(
      async (tx) => {
        const createdTables = []

        // Process tables in smaller batches
        const BATCH_SIZE = 5
        for (let i = 0; i < tables.length; i += BATCH_SIZE) {
          const batch = tables.slice(i, i + BATCH_SIZE)

          // Create tables in current batch
          const batchPromises = batch.map((config) => {
            const { tableNumber, seats } = config
            return tx.table.create({
              data: {
                name: `Table${tableNumber}`,
                Seat: {
                  create: Array.from({ length: seats }, (_, index) => ({
                    seat: index + 1,
                    isBooked: false,
                  })),
                },
              },
            })
          })

          const batchResults = await Promise.all(batchPromises)
          createdTables.push(...batchResults)
        }

        return createdTables
      },
      {
        timeout: 20000, // Increase timeout to 20 seconds
        maxWait: 20000, // Maximum time to wait for transaction to start
      },
    )

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully created ${result.length} tables`,
    })
  } catch (error) {
    console.error("Error creating bulk tables:", error)

    // Improved error handling
    let errorMessage = "Failed to create tables"
    if (error instanceof Error) {
      if (error.message.includes("Transaction already closed")) {
        errorMessage = "Operation timed out. Please try creating fewer tables at once."
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

