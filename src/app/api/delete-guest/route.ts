import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(req: Request) {
  try {
    const { guestId } = await req.json()

    if (!guestId) {
      return NextResponse.json({ success: false, message: "Guest ID is required" }, { status: 400 })
    }

    // Check if the guest exists and has no seat assignments
    const guest = await db.users.findUnique({
      where: { id: guestId },
      include: { seat: true },
    })

    if (!guest) {
      return NextResponse.json({ success: false, message: "Guest not found" }, { status: 404 })
    }

    if (guest.seat.length > 0) {
      return NextResponse.json(
        { success: false, message: "Cannot delete guest with seat assignments" },
        { status: 400 },
      )
    }

    // Delete the guest
    await db.users.delete({
      where: { id: guestId },
    })

    return NextResponse.json({ success: true, message: "Guest deleted successfully" })
  } catch (error) {
    console.error("Failed to delete guest:", error)
    return NextResponse.json({ success: false, message: "Failed to delete guest" }, { status: 500 })
  }
}

