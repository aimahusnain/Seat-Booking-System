import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { Queue } from "bullmq"

const prisma = new PrismaClient()

// Initialize a Bull queue
const importQueue = new Queue("guestImport", {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number.parseInt(process.env.REDIS_PORT || "6379"),
  },
})

interface Guest {
  firstname: string
  lastname: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body || !body.guests || !Array.isArray(body.guests)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request format. Expected an array of guests.",
        },
        { status: 400 },
      )
    }

    const { guests } = body as { guests: Guest[] }

    // Validate guest data
    const validGuests = guests.filter(
      (guest): guest is Guest =>
        guest &&
        typeof guest.firstname === "string" &&
        typeof guest.lastname === "string" &&
        guest.firstname.trim() !== "" &&
        guest.lastname.trim() !== "",
    )

    if (validGuests.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid guests found in the data",
        },
        { status: 400 },
      )
    }

    // Add the import job to the queue
    const job = await importQueue.add("importGuests", {
      guests: validGuests,
    })

    return NextResponse.json({
      success: true,
      message: "Import job started",
      jobId: job.id,
    })
  } catch (error) {
    console.error("Error starting import job:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to start import job",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

