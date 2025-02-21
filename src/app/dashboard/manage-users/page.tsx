"use client"

import type React from "react"

import { Check, Edit2, FileX, Key, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  name: string | null
  password: string
}

export default function ManageUsers() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")

  useEffect(() => {
    if (session?.user?.email !== "admin") {
      router.push("/dashboard")
      return
    }
    fetchUsers()
  }, [session, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.log(error)
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsRegistering(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    try {
      // Check for existing user
      const existingUser = users.find((user) => user.email === email)
      if (existingUser) {
        toast.error("Email already exists!")
        return
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      toast.success("User registered successfully!")
      fetchUsers()
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.log(error)
      toast.error("Failed to register user")
    } finally {
      setIsRegistering(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const res = await fetch(`/api/users/delete?id=${userId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete user")
      }

      toast.success("User deleted successfully")
      fetchUsers()
    } catch (error) {
      toast.error(`Failed to delete user - ${error}`)
    }
  }

  const handleUpdate = async (userId: string, newPassword: string) => {
    if (!newPassword.trim()) {
      toast.error("Password cannot be empty")
      return
    }

    try {
      const res = await fetch(`/api/users/delete?id=${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      })

      if (!res.ok) {
        throw new Error("Failed to update password")
      }

      toast.success("Password updated successfully")
      setEditingUser(null)
      setNewPassword("")
      fetchUsers()
    } catch (error) {
      console.log(error)
      toast.error("Failed to update password")
    }
  }

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleGeneratePassword = () => {
    const password = generatePassword()
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement
    if (passwordInput) {
      passwordInput.value = password
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-zinc-900">Admin Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Register Card */}
        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900">Register New User</h2>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Username</label>
                <input
                  name="email"
                  required
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Password</label>
                <div className="relative">
                  <input
                    type="text"
                    name="password"
                    required
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                  >
                    <Key className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isRegistering}
                className="flex items-center space-x-2 rounded-lg bg-zinc-900 px-6 py-3 text-white transition-colors duration-200 hover:bg-zinc-800"
              >
                {isRegistering ? (
                  <span className="flex items-center">
                    <svg
                      className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Register User"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-2xl font-semibold text-zinc-900">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Password
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition-colors duration-150 hover:bg-zinc-50 ${
                      user.email === "admin" ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td className="whitespace-nowrap px-6 py-4">{user.name}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        {user.email}
                        {user.email === "admin" && (
                          <span className="ml-2 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {editingUser?.id === user.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="rounded-lg border px-3 py-1 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
                          />
                          <button
                            onClick={() => handleUpdate(user.id, newPassword)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(null)
                              setNewPassword("")
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FileX className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <span className="rounded-lg bg-zinc-100 px-3 py-1 font-mono text-zinc-700">
                          {user.password}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setEditingUser(user)
                            setNewPassword(user.password)
                          }}
                          className="text-zinc-600 transition-colors hover:text-zinc-900"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        {user.email !== "admin" && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-zinc-600 transition-colors hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

