// types/booking.ts

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  seat: UserSeat[];
}

export interface UserSeat {
  id: string;
  seat: number;
  table: {
    id: string;
    name: string;
  };
}

export interface Seat {
  id: string;
  tableId: string;
  tableName: string;
  tableNumber: number;
  seatNumber: number;
  isBooked: boolean;
  userId: string | null;
  user: {
    id: string;
    firstname: string;
    lastname: string;
  } | null;
}

export interface TableData {
  id?: string;  // Add this line
  tableNumber: number;
  name?: string;  // Add this line
  seats: Seat[];
}

// This type represents the actual API response structure
export interface GuestApiResponse {
  data: User[];
}
