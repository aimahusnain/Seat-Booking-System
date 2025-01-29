'use client'

import { useEffect, useState } from 'react'
import type { Seat } from '../types/booking'

export const useSeats = () => {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await fetch('/api/get-seat')
        const result = await response.json()
        
        if (result.success) {
          const formattedSeats = result.data.map((seat: { id: string, tableId: string, table: { name: string }, seat: number, isBooked: boolean, userId: string }) => ({
            id: seat.id,
            tableId: seat.tableId,
            tableName: seat.table.name,
            tableNumber: parseInt(seat.table.name.replace('Table', '')), // Extract number from "Table1"
            seatNumber: seat.seat,
            isBooked: seat.isBooked,
            userId: seat.userId
          }))
          setSeats(formattedSeats)
        } else {
          setError('Failed to fetch seats')
        }
      } catch (err) {
        setError(`Error fetching seats ${err}`)
      } finally {
        setLoading(false)
      }
    }

    fetchSeats()
  }, [])

  return { seats, loading, error }
}