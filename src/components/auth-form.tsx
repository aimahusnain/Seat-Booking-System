"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface AuthFormProps {
  onAuthenticate: () => void
}

export default function AuthForm({ onAuthenticate }: AuthFormProps) {
  const [password, setPassword] = useState("")

  const sha256 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return hashHex
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Replace this with your actual password hash
    const correctPasswordHash = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" // SHA-256 hash of "password"

    const inputHash = await sha256(password)

    if (inputHash === correctPasswordHash) {
      onAuthenticate()
    } else {
      toast.error("Invalid password")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Seat Booking System</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Enter
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

