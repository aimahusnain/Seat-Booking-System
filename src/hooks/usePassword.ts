import { useState, useEffect } from "react";

export async function getPasswordHashes() {
  try {
    const response = await fetch("/api/get-password", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch passwords");
    }

    const data = await response.json();
    if (!data.success || !data.data || data.data.length === 0) {
      throw new Error("No passwords found");
    }

    // Return an array of password hashes
    return data.data.map((item: { passsword: string }) => item.passsword);
  } catch (error) {
    console.error("Error fetching password hashes:", error);
    throw error;
  }
}

export function usePassword() {
  const [passwords, setPasswords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const fetchedPasswords = await getPasswordHashes();
        setPasswords(fetchedPasswords);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPasswords();
  }, []);

  return { passwords, loading, error };
}

