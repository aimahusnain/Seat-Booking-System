import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Guest {
  firstname: string;
  lastname: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.guests || !Array.isArray(body.guests)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request format. Expected an array of guests.",
        },
        { status: 400 }
      );
    }

    const { guests } = body as { guests: Guest[] };

    // Validate guest data
    const validGuests = guests.filter(
      (guest): guest is Guest =>
        guest &&
        typeof guest.firstname === "string" &&
        typeof guest.lastname === "string" &&
        guest.firstname.trim() !== "" &&
        guest.lastname.trim() !== ""
    );

    if (validGuests.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid guests found in the data",
        },
        { status: 400 }
      );
    }

    const batchSize = 11;
    const importedGuests: Guest[] = [];
    const duplicateGuests: Guest[] = [];
    const failedGuests: Guest[] = [];
    const errors: string[] = [];

    for (let i = 0; i < validGuests.length; i += batchSize) {
      const batch = validGuests.slice(i, i + batchSize);

      try {
        const results = await prisma.$transaction(async (tx) => {
          const batchResults: Guest[] = [];

          for (const guest of batch) {
            const fullName =
              `${guest.firstname.trim()} ${guest.lastname.trim()}`.toLowerCase();

            // Check for existing guest
            const existingGuest = await tx.users.findFirst({
              where: {
                firstname: {
                  equals: guest.firstname.trim(),
                  mode: "insensitive",
                },
                lastname: {
                  equals: guest.lastname.trim(),
                  mode: "insensitive",
                },
              },
            });

            if (!existingGuest) {
              const newGuest = await tx.users.create({
                data: {
                  firstname: guest.firstname.trim(),
                  lastname: guest.lastname.trim(),
                },
              });
              batchResults.push(newGuest);
            } else {
              duplicateGuests.push(guest);
            }
          }

          return batchResults;
        });

        importedGuests.push(...results);

        // Send progress update
        const progress = {
          currentCount: importedGuests.length,
          totalCount: validGuests.length,
          duplicateCount: duplicateGuests.length,
        };

        // In a real-time scenario, you would emit this progress to the client
        // For example, using Server-Sent Events or WebSockets
        console.log("Progress update:", progress);
      } catch (error) {
        console.error(`Error processing batch ${i}-${i + batchSize}:`, error);
        errors.push(`Failed to process guests ${i}-${i + batchSize}`);
        failedGuests.push(...batch);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: importedGuests.length,
      totalProcessed: validGuests.length,
      duplicateCount: duplicateGuests.length,
      failedGuests: failedGuests,
      duplicateGuests: duplicateGuests,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error importing guests:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to import guests",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
