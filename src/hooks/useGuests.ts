'use client'

import { useEffect, useState } from 'react'

interface Guest {
  id: string
  firstname: string
  lastname: string
  seat: Array<{
    id: string
    seat: number
    table: {
      name: string
    }
  }>
}

export const useGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await fetch('/api/get-guests')
        const result = await response.json()
        
        if (result.success) {
          setGuests(result.data)
        } else {
          setError('Failed to fetch guests')
        }
      } catch (err) {
        setError(`Error fetching guests ${err}`)
      } finally {
        setLoading(false)
      }
    }

    fetchGuests()
  }, [])

  return { guests, loading, error }
}