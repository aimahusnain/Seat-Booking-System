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
      setBookedSeats(newSeats.filter(seat => seat.isBooked))
      setIsInitialLoad(false)
    } else {
      setBookedSeats(prevBookedSeats => {
        const updatedBookedSeats = [...prevBookedSeats]
        
        newSeats.forEach(newSeat => {
          if (newSeat.isBooked) {
            const existingIndex = updatedBookedSeats.findIndex(
              booked => booked.id === newSeat.id
            )
            
            if (existingIndex === -1) {
              updatedBookedSeats.push(newSeat)
            } else {
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
    fetchSeats()
    const intervalId = setInterval(fetchSeats, 60000)
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
    updateBookedSeat,
    fetchSeats // Export the fetchSeats function
  }
}