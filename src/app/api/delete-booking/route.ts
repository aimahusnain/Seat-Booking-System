import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// @/app/api/delete-booking
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { seatId } = body;

    // Update the seat without deleting the user
    const updatedSeat = await db.seat.update({
      where: {
        id: seatId,
      },
      data: {
        isBooked: false,
        isReceived: false,
        userId: null,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSeat,
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete booking",
      },
      { status: 500 }
    );
  }
}