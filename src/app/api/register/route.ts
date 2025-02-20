import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Store password without encryption
    const user = await prisma.user.create({
      data: {
        email,
        password, // Plain text password
        name
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal error", { status: 500 });
  }
}