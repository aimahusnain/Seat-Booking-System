import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
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
