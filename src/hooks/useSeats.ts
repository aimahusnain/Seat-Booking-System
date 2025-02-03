"use client"

import { useState, useEffect } from "react"
import type { Seat } from "@/types/booking"

export function useSeats() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSeats() {
      try {
        const response = await fetch("/api/get-seat")
        const data = await response.json()
        if (data.success) {
          setSeats(data.data)
        } else {
          setError(data.message)
        }
      } catch (err) {
        setError("Failed to fetch seats")
      } finally {
        setLoading(false)
      }
    }

    fetchSeats()
  }, [])

  return { seats, loading, error }
}



// "use client"

// import { useEffect, useState } from "react"
// import type { Seat } from "../types/booking"

// export const useSeats = () => {
//   const [seats, setSeats] = useState<Seat[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const fetchSeats = async () => {
//       try {
//         const response = await fetch("/api/get-seat")
//         const result = await response.json()

//         if (result.success) {
//           const formattedSeats: Seat[] = result.data.map((seat: { id: string; tableId: string; table: { name: string }; seat: number; isBooked: boolean; userId: string; user: { id: string; firstname: string; lastname: string } | null }) => ({
//             id: seat.id,
//             tableId: seat.tableId,
//             tableName: seat.table.name,
//             tableNumber: Number.parseInt(seat.table.name.replace("Table", "")),
//             seatNumber: seat.seat,
//             isBooked: seat.isBooked,
//             userId: seat.userId,
//             user: seat.user
//               ? {
//                   id: seat.user.id,
//                   firstname: seat.user.firstname,
//                   lastname: seat.user.lastname,
//                 }
//               : null,
//           }))
//           setSeats(formattedSeats)
//         } else {
//           setError("Failed to fetch seats")
//         }
//       } catch (err) {
//         setError(`Error fetching seats ${err}`)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchSeats()
//   }, [])

//   return { seats, loading, error }
// }

