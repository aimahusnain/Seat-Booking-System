import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ users: [] })
    }

    const users = await db.users.findMany({
      where: {
        OR: [
          {
            firstname: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            lastname: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      take: 5,
      select: {
        id: true,
        firstname: true,
        lastname: true,
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Search names error:", error)
    return NextResponse.json({ users: [] })
  }
}

