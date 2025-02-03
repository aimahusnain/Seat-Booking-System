"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff } from "lucide-react"

interface AuthFormProps {
  onAuthenticate: () => void
}

export default function AuthForm({ onAuthenticate }: AuthFormProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  // Remove this line
  // const [isChangePasswordMode, setIsChangePasswordMode] = useState(false)

  const sha256 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return hashHex
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const correctPasswordHash = "960596e95046987cdee0c19fcb38235fa6602391acef6a2219c4f281e427aff3"
      const inputHash = await sha256(password)

      if (inputHash === correctPasswordHash) {
        toast.success("Welcome back!")
        onAuthenticate()
      } else {
        toast.error("Incorrect password")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] dark:bg-[#1a1a1a]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md px-4"
      >
        <Card className="overflow-hidden border-none bg-white/80 backdrop-blur-md dark:bg-black/80">
          <CardHeader className="space-y-4 pb-6 pt-8 text-center">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                <Lock className="stroke-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight">Seat Booking System</CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-0 bg-gray-50 text-lg shadow-inner dark:bg-gray-900 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Enter"
                )}
              </Button>
              {/* Remove this button */}
              {/* <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangePasswordMode(!isChangePasswordMode)}
                className="w-full"
              >
                {isChangePasswordMode ? "Back to Login" : "Change Password"}
              </Button> */}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

