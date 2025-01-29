export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const guests = await db.users.findMany({
      include: {
        seat: {
          include: {
            table: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: guests
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch guests ${error}`,
      },
      { status: 500 }
    );
  }
}