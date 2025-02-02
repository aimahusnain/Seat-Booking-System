"use client"

import { useState, useEffect } from "react"
import SeatBooking from "@/components/seat-booking"
import AuthForm from "@/components/auth-form"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated")
    if (auth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleAuthenticate = () => {
    setIsAuthenticated(true)
  }

  return <>{isAuthenticated ? <SeatBooking /> : <AuthForm onAuthenticate={handleAuthenticate} />}</>
}

