// Updated type definitions to match Prisma schema and fix type errors
export interface Table {
  id: number
  name: string
  notes: string
  Seat: Seat[]
}

export interface User {
  id: string
  firstname: string
  lastname: string
  seat: Seat[]
}

export interface Seat {
  id: string
  tableId: string
  seat: number
  isBooked: boolean
  isReceived: boolean
  userId: string | null
  table: Table
  user: User | null
  tableNumber: number
  seatNumber: number
}

export interface TableData {
  tableNumber: number
  seats: Seat[]
}

export interface Person {
  id: string
  firstName: string
  lastName: string
}

// Helper type for updating seats
export interface UpdatedSeat extends Omit<Seat, "user"> {
  user: {
    id: string
    firstname: string
    lastname: string
    seat: Seat[]
  } | null
}

