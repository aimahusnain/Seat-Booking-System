import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { tableNumber } = await req.json();
    const tableName = `Table ${tableNumber}`;

    // First find the table by name
    const table = await db.table.findFirst({
      where: {
        name: tableName,
      },
      select: {
        id: true,
      },
    });

    if (!table) {
      return NextResponse.json(
        { success: false, message: "Table not found" },
        { status: 404 }
      );
    }

    // Delete all seats associated with the table
    await db.seat.deleteMany({
      where: {
        tableId: table.id,
      },
    });

    // Delete the table using its ID
    await db.table.delete({
      where: {
        id: table.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete table:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete table" },
      { status: 500 }
    );
  }
}
