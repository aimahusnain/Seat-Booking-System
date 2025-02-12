import { useState, useEffect, useCallback } from "react"
import type { Seat } from "@/types/booking"

export function useSeats() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [bookedSeats, setBookedSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const updateSeatsWithoutResetingBooked = useCallback((newSeats: Seat[]) => {
    setSeats(newSeats)
    
    if (isInitialLoad) {
      // On initial load, set booked seats
      setBookedSeats(newSeats.filter(seat => seat.isBooked))
      setIsInitialLoad(false)
    } else {
      // On subsequent updates, only add new bookings or update existing ones
      setBookedSeats(prevBookedSeats => {
        const updatedBookedSeats = [...prevBookedSeats]
        
        newSeats.forEach(newSeat => {
          if (newSeat.isBooked) {
            const existingIndex = updatedBookedSeats.findIndex(
              booked => booked.id === newSeat.id
            )
            
            if (existingIndex === -1) {
              // Add new booking
              updatedBookedSeats.push(newSeat)
            } else {
              // Update existing booking's status (e.g., isReceived)
              updatedBookedSeats[existingIndex] = {
                ...updatedBookedSeats[existingIndex],
                isReceived: newSeat.isReceived
              }
            }
          }
        })
        
        return updatedBookedSeats
      })
    }
  }, [isInitialLoad])

  const fetchSeats = useCallback(async () => {
    try {
      const response = await fetch("/api/get-seat")
      const data = await response.json()
      if (data.success) {
        updateSeatsWithoutResetingBooked(data.data)
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError(`Failed to fetch seats ${error}`)
    } finally {
      setLoading(false)
    }
  }, [updateSeatsWithoutResetingBooked])

  useEffect(() => {
    // Initial fetch
    fetchSeats()

    // Set up polling every 5 seconds
    const intervalId = setInterval(fetchSeats, 60000)

    // Cleanup function to clear the interval when component unmounts
    return () => clearInterval(intervalId)
  }, [fetchSeats])

  const addBookedSeat = (newSeat: Seat) => {
    setBookedSeats(prev => [...prev, newSeat])
  }

  const removeBookedSeat = (seatId: string) => {
    setBookedSeats(prev => prev.filter(seat => seat.id !== seatId))
  }

  const updateBookedSeat = (seatId: string, updates: Partial<Seat>) => {
    setBookedSeats(prev => 
      prev.map(seat => 
        seat.id === seatId ? { ...seat, ...updates } : seat
      )
    )
  }

  return { 
    seats, 
    bookedSeats, 
    loading, 
    error,
    addBookedSeat,
    removeBookedSeat,
    updateBookedSeat
  }
}