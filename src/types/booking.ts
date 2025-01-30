export interface Person {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Seat {
  id: string
  tableId: string
  tableName: string
  tableNumber: number
  seatNumber: number
  isBooked: boolean
  userId: string | null
  user: {
    id: string
    firstname: string
    lastname: string
  } | null
}



export interface TableData {
  tableNumber: number;
  seats: Seat[];
}