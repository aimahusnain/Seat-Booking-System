import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const { tableId, newName, newSeatsCount } = await req.json();

    if (!tableId || !newName || !newSeatsCount) {
      return NextResponse.json(
        {
          success: false,
          message: "Table ID, name, and seats count are required",
        },
        { status: 400 }
      );
    }

    // Validate seats count
    if (newSeatsCount < 1 || newSeatsCount > 20) {
      return NextResponse.json(
        { success: false, message: "Seats count must be between 1 and 20" },
        { status: 400 }
      );
    }

    // Get current seats for this table
    const currentSeats = await prisma.seat.findMany({
      where: { tableId },
      orderBy: { seat: "asc" },
    });

    const currentSeatsCount = currentSeats.length;

    // Update table name
    await prisma.table.update({
      where: { id: tableId },
      data: { name: newName },
    });

    if (newSeatsCount > currentSeatsCount) {
      // Add new seats
      const seatsToAdd = newSeatsCount - currentSeatsCount;
      const newSeats = [];

      // Find the highest seat number in the current seats
      const maxSeatNumber =
        currentSeats.length > 0
          ? Math.max(...currentSeats.map((seat) => seat.seat))
          : 0;

      for (let i = 1; i <= seatsToAdd; i++) {
        newSeats.push({
          tableId,
          seat: maxSeatNumber + i,
          isBooked: false,
          isReceived: false,
        });
      }

      await prisma.seat.createMany({
        data: newSeats,
      });
    } else if (newSeatsCount < currentSeatsCount) {
      // Remove seats (starting from the end, skip booked seats)
      const seatsToRemove = currentSeatsCount - newSeatsCount;
      const unbookedSeats = currentSeats
        .filter((seat) => !seat.isBooked)
        .slice(-seatsToRemove);

      if (unbookedSeats.length < seatsToRemove) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot remove ${seatsToRemove} seats. Only ${unbookedSeats.length} unbooked seats available at the end.`,
          },
          { status: 400 }
        );
      }

      await prisma.seat.deleteMany({
        where: {
          id: {
            in: unbookedSeats.map((seat) => seat.id),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Table updated successfully",
    });
  } catch (error) {
    console.error("Error updating table:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update table" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
