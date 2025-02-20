"use client";

import { Check, Edit2, FileX, Key, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string | null;
  password: string;
}

export default function ManageUsers() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (session?.user?.email !== "jodel123@gmail.com") {
      router.push("/dashboard");
      return;
    }
    fetchUsers();
  }, [session, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error(`Failed to fetch users - ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRegistering(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      // Check for existing user
      const existingUser = users.find((user) => user.email === email);
      if (existingUser) {
        toast.error("Email already exists!");
        setIsRegistering(false);
        return;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: formData.get("password"),
          name: formData.get("name"),
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success("User registered successfully!");
      fetchUsers();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error(`Failed to register user ${error}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to delete user ${error}`);
    }
  };

  const handleUpdate = async (userId: string, newPassword: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) throw new Error("Failed to update password");

      toast.success("Password updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to update password - ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const password = generatePassword();
    const passwordInput = document.querySelector(
      'input[name="password"]'
    ) as HTMLInputElement;
    if (passwordInput) {
      passwordInput.value = password;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-zinc-900">
              Admin Dashboard
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-6">
            Register New User
          </h2>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="password"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                  >
                    <Key className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isRegistering}
                className="px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors duration-200 flex items-center space-x-2"
              >
                {isRegistering ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-2xl font-semibold text-zinc-900">
              User Management
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Password
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-zinc-50 transition-colors duration-150 ${
                      user.email === "jodel123@gmail.com" ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.email}
                        {user.email === "jodel123@gmail.com" && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser?.id === user.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newPassword || user.password}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="border rounded-lg px-3 py-1 focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => handleUpdate(user.id, newPassword)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(null);
                              setNewPassword("");
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FileX className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono bg-zinc-100 px-3 py-1 rounded-lg text-zinc-700">
                          {user.password}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setNewPassword("");
                          }}
                          className="text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        {user.email !== "jodel123@gmail.com" && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-zinc-600 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
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
  );
}
