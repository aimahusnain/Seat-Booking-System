import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Find all users with their seat relationships
    const users = await prisma.users.findMany({
      include: {
        seat: true,
      },
    });

    // Create a map to store users by their name
    const userGroups = new Map<string, typeof users>();

    // Group users by their names
    users.forEach((user) => {
      const key = `${user.firstname.toLowerCase()}-${user.lastname.toLowerCase()}`;
      if (!userGroups.has(key)) {
        userGroups.set(key, []);
      }
      userGroups.get(key)?.push(user);
    });

    const idsToDelete = new Set<string>();

    // Process each group of users with the same name
    for (const [, duplicateUsers] of userGroups) {
      if (duplicateUsers.length <= 1) continue;

      // Sort users: users with seats come first
      const sortedUsers = duplicateUsers.sort((a, b) => {
        // Keep users with seats
        if (a.seat.length > 0 && b.seat.length === 0) return -1;
        if (a.seat.length === 0 && b.seat.length > 0) return 1;
        // If both have or don't have seats, keep the first one
        return 0;
      });

      // Mark all duplicate users without seats for deletion
      // Keep the first user with a seat, or the first user if none have seats
      for (let i = 1; i < sortedUsers.length; i++) {
        const user = sortedUsers[i];
        // Only delete if the user has no seats
        if (user.seat.length === 0) {
          idsToDelete.add(user.id);
        }
      }
    }

    // Delete the duplicate users without seats
    if (idsToDelete.size > 0) {
      await prisma.users.deleteMany({
        where: {
          id: {
            in: Array.from(idsToDelete),
          },
        },
      });
    }

    return NextResponse.json({
      message: "Duplicates removed successfully",
      removedCount: idsToDelete.size,
    });
  } catch (error) {
    console.error("Error removing duplicates:", error);
    return NextResponse.json(
      { error: "Failed to remove duplicates" },
      { status: 500 }
    );
  }
}
