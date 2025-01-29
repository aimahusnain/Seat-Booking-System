export interface Person {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Seat {
  id: string;
  tableId: string;
  tableName: string;
  tableNumber: number;
  seatNumber: number;
  isBooked: boolean;
  userId?: string;
  bookedBy?: Person;
}

export interface TableData {
  tableNumber: number;
  seats: Seat[];
}