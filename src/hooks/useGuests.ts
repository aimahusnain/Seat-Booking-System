"use client"

import type { User } from "../types/booking"
import { useEffect } from "react"
import useSWR from "swr"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch guests")
  return res.json()
}

export function useGuests() {
  const { data, error, isLoading, mutate } = useSWR<{ data: User[] }>("/api/get-guests", fetcher, {
    refreshInterval: 1000,
  })

  useEffect(() => {
    // Replace with your actual WebSocket URL
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3001")

    ws.onmessage = () => {
      mutate()
    }

    return () => {
      ws.close()
    }
  }, [mutate])

  return {
    guests: data?.data ?? [],
    loading: isLoading,
    error: error,
    mutate,
  }
}

