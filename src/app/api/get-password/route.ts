export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth.config"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
      select: {
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: [{ passsword: user.password }],
    })
  } catch (error) {
    console.error("Error fetching user password:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch user password: ${error}`,
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

