export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const password = await db.password.findMany();

    return NextResponse.json({
      success: true,
      data: password,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch password ${error}`,
      },
      { status: 500 }
    );
  }
}
