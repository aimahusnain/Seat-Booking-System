// app/api/washup/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE() {
  try {
    // Delete in correct order due to foreign key constraints
    // First delete Seats (has foreign keys to Table and Users)
    await prisma.seat.deleteMany();
    
    // Then delete Users (guests)
    await prisma.users.deleteMany();
    
    // Finally delete Tables
    await prisma.table.deleteMany();

    return NextResponse.json(
      { message: 'All data deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}