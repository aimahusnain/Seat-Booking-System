import { PrismaClient } from "@prisma/client"
import { type NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"

const prisma = new PrismaClient()

export async function DELETE(
  req: NextRequest,
  context: { params: { userId: string } }
) {
  try {
    console.log(req)
    const session = await getServerSession(authOptions)

    if (session?.user?.email !== "jodel123@gmail.com") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.user.delete({
      where: {
        id: context.params.userId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.email !== "jodel123@gmail.com") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { password } = body

    const updatedUser = await prisma.user.update({
      where: {
        id: context.params.userId,
      },
      data: {
        password,
      },
    })

    return NextResponse.json(updatedUser)
  } catch {
    return new NextResponse("Internal error", { status: 500 })
  }
}