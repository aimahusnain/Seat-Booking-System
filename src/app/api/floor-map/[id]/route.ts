// app/api/floor-map/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE - Delete a specific floor map by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Check if image exists
    const existingImage = await prisma.image.findUnique({
      where: { id },
    });

    if (!existingImage) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete the image
    await prisma.image.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Floor map deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete floor map error:', error);
    return NextResponse.json(
      { error: 'Failed to delete floor map' },
      { status: 500 }
    );
  }
}