export interface Table {
  id: string
  name: string
}

export interface User {
  id: string
  firstname: string
  lastname: string
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

