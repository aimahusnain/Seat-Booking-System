import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.email !== "jodel123@gmail.com") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });

    return NextResponse.json(users);
  } catch {
    return new NextResponse("Internal error", { status: 500 });
  }
}