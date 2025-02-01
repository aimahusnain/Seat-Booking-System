import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstname, lastname } = body;

    if (!firstname || !lastname) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    const newGuest = await db.users.create({
      data: {
        firstname,
        lastname,
      },
    });

    return NextResponse.json({ success: true, data: newGuest });
  } catch (error) {
    console.error("Error adding guest:", error);
    return NextResponse.json({ error: "Failed to add guest" }, { status: 500 });
  }
}
