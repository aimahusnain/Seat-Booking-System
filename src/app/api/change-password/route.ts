import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 401 })
    }

    // Update the password
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: newPassword,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

