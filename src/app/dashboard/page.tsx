"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {session?.user?.email}</p>
      <button
        onClick={handleSignOut}
        className="mt-4 bg-red-500 text-white rounded-md px-4 py-2"
      >
        Sign out
      </button>
    </div>
  );
}