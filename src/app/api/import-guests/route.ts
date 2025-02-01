import { NextResponse } from "next/server";

interface Guest {
  firstname: string;
  lastname: string;
}

async function addGuest(guest: Guest) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/add-guest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(guest),
  });

  if (!response.ok) {
    throw new Error(`Failed to add guest: ${response.statusText}`);
  }

  return response.json();
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

    const importedGuests: Guest[] = [];
    const failedGuests: Guest[] = [];
    const errors: string[] = [];

    for (const guest of validGuests) {
      try {
        const result = await addGuest(guest);
        if (result.success) {
          importedGuests.push(guest);
        } else {
          failedGuests.push(guest);
          errors.push(`Failed to add guest ${guest.firstname} ${guest.lastname}: ${result.error}`);
        }

        // Send progress update
        const progress = {
          currentCount: importedGuests.length + failedGuests.length,
          totalCount: validGuests.length,
          successCount: importedGuests.length,
          failureCount: failedGuests.length,
        };

        // In a real-time scenario, you would emit this progress to the client
        // For example, using Server-Sent Events or WebSockets
        console.log("Progress update:", progress);
      } catch (error) {
        console.error(`Error processing guest ${guest.firstname} ${guest.lastname}:`, error);
        errors.push(`Failed to process guest ${guest.firstname} ${guest.lastname}: ${error}`);
        failedGuests.push(guest);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: importedGuests.length,
      totalProcessed: validGuests.length,
      failedCount: failedGuests.length,
      failedGuests: failedGuests,
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
  }
}
