import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>Welcome to Seating4you</div>
      <Link href="/login">
        <Button variant="secondary">Let&apos;s start</Button>
      </Link>
    </main>
  );
}

// "use client";

// import { useState } from "react";
// import SeatBooking from "@/components/seat-booking";
// import AuthForm from "@/components/auth-form";

// export default function Page() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const handleAuthenticate = () => {
//     setIsAuthenticated(true);
//   };

//   return (
//     <main className="bg-zinc-50">
//       {isAuthenticated ? (
//         <SeatBooking />
//       ) : (
//         <AuthForm onAuthenticate={handleAuthenticate} />
//       )}
//     </main>
//   );
// }
