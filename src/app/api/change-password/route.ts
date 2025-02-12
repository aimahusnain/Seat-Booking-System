import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { newPasswordHash, passwordId } = await request.json()

    if (!newPasswordHash || !passwordId) {
      return NextResponse.json(
        { success: false, message: "New password hash and password ID are required" },
        { status: 400 },
      )
    }

    // Update the specific password entry
    await db.password.update({
      where: {
        id: passwordId,
      },
      data: {
        passsword: newPasswordHash,
      },
    })

    return NextResponse.json({ success: true, message: "Password updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ success: false, message: `Failed to change password: ${error}` }, { status: 500 })
  }
}

