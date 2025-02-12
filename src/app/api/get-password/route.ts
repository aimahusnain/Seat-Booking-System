export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const passwords = await db.password.findMany()

    return NextResponse.json({
      success: true,
      data: passwords,
    })
  } catch (error) {
    console.error("Error fetching passwords:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch passwords: ${error}`,
      },
      { status: 500 },
    )
  }
}