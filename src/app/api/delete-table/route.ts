import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    // Log the raw body first
    const body = await req.text();
    console.log("Raw request body:", body);
    
    // Parse the JSON
    const parsedBody = JSON.parse(body);
    console.log("Parsed body:", parsedBody);
    
    const { tableId } = parsedBody; // Changed from tableNumber to tableId

    if (!tableId) {
      return NextResponse.json(
        { success: false, message: "Table ID is required" },
        { status: 400 }
      );
    }

    // tableId is the actual database table ID
    console.log("Table ID to delete:", tableId);

    // Delete all seats associated with the table
    await db.seat.deleteMany({
      where: {
        tableId: tableId,
      },
    });

    // Delete the table itself
    await db.table.delete({
      where: {
        id: tableId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete table:", error);
    return NextResponse.json(
      { success: false, message: `Failed to delete table: ${error}` },
      { status: 500 }
    );
  }
}