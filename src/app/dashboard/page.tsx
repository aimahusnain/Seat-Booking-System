// app/dashboard/page.tsx
'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Redirect to login page if user is unauthenticated
      router.push("/auth/signin");
    }
  }, [status, router]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {session ? (
        <div className="p-8 bg-white rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p>Welcome, {session?.user?.name}</p>
          <button
            onClick={() => signOut({ redirect: true })}
            className="mt-4 p-2 bg-red-500 text-white rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DashboardPage;



// "use client";

// import SeatBooking from "@/components/seat-booking";

// export default function Dashboard() {
//   return (
//     <div>
//         <SeatBooking />
//     </div>
//   );
// }
