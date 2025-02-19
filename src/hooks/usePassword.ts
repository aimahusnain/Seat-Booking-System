"use client"

import { useState, useEffect } from "react"

export async function getPasswordHashes() {
  try {
    const response = await fetch("/api/get-password", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch password")
    }

    const data = await response.json()
    if (!data.success || !data.data || data.data.length === 0) {
      throw new Error("No password found")
    }

    // Return an array of password hashes
    return data.data.map((item: { password: string }) => item.password)
  } catch (error) {
    console.error("Error fetching password hash:", error)
    throw error
  }
}

export function usePassword() {
  const [passwordHash, setPasswordHash] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPassword = async () => {
      try {
        const fetchedPasswords = await getPasswordHashes()
        setPasswordHash(fetchedPasswords[0] || null)
      } catch (err) {
        setError((err as Error).message)
        setPasswordHash(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPassword()
  }, [])

  return { passwordHash, loading, error }
}

