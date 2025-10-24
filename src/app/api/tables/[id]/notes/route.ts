import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the import path to your prisma instance

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { notes } = body;

    const updatedTable = await db.table.update({
      where: { id },
      data: { notes },
    });

    return NextResponse.json({
      success: true,
      data: updatedTable,
    });
  } catch (error) {
    console.error("Error updating table notes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notes" },
      { status: 500 }
    );
  }
}