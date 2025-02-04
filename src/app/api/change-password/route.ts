export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { newPasswordHash } = body;

    if (!newPasswordHash) {
      return NextResponse.json(
        { success: false, message: "New password hash is required" },
        { status: 400 }
      );
    }

    // Get the first password record (assuming there's only one)
    const passwordRecord = await db.password.findFirst();

    if (!passwordRecord) {
      // If no password exists, create one
      await db.password.create({
        data: {
          passsword: newPasswordHash,
        },
      });
    } else {
      // Update existing password
      await db.password.update({
        where: {
          id: passwordRecord.id,
        },
        data: {
          passsword: newPasswordHash,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to change password: ${error}`,
      },
      { status: 500 }
    );
  }
}