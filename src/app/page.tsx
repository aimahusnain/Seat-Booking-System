"use client";

import { useState } from "react";
import SeatBooking from "@/components/seat-booking";
import AuthForm from "@/components/auth-form";

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
  };

  return (
    <main className="bg-zinc-50">
      {isAuthenticated ? (
        <SeatBooking />
      ) : (
        <AuthForm onAuthenticate={handleAuthenticate} />
      )}
      
    </main>
  );
}
