export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allUnits = await db.seat.findMany({
      include: {
        table: true,
        user: true,
      },
    });

    if (allUnits.length > 0) {
      return NextResponse.json({
        success: true,
        data: allUnits,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "No units found",
      });
    }
  } catch (e) {
    return NextResponse.json({
      success: false,
      message: `Something went wrong! Please try again ${e}`,
    });
  }
}
