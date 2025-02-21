export interface Table {
    id: string
    name: string
    Seat: Seat[]
  }
  
  export interface Seat {
    id: string
    tableId: string
    seat: number
    isBooked: boolean
    isReceived: boolean
    userId: string | null
  }
  
  export interface User {
    id: string
    email: string
    password: string
    name?: string | null
  }
  
  export interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
    }
  }
  
  