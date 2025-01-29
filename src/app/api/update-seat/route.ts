import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { seatId, userId } = body;

    const updatedSeat = await db.seat.update({
      where: {
        id: seatId,
      },
      data: {
        isBooked: true,
        userId: userId,
      },
      include: {
        table: true,
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSeat,
    });
  } catch (error) {
    console.error("Error updating seat:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update seat",
      },
      { status: 500 }
    );
  }
}