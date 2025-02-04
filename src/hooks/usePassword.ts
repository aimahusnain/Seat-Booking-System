export async function getPasswordHash() {
    try {
      const response = await fetch("/api/get-password", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch password");
      }
  
      const data = await response.json();
      if (!data.success || !data.data?.[0]?.passsword) {
        throw new Error("No password found");
      }
  
      // Return the hash directly since it's already hashed in the database
      return data.data[0].passsword;
    } catch (error) {
      console.error("Error fetching password hash:", error);
      throw error;
    }
  }