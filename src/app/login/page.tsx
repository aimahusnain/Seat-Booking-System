"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const response = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (response?.error) {
      toast.error("Invalid credentials");
      setLoading(false);
      return;
    }

    toast.success("Logged in successfully!");
    router.push("/dashboard");
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* About Section */}
      <div className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="space-y-1 mb-12">
            <h1 className="text-5xl font-light tracking-tight text-black">
              Seating4U
            </h1>
            <p className="text-gray-500 text-sm tracking-wider uppercase">
              Excellence in every event
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                A smart, user-friendly platform that simplifies seating arrangements 
                for weddings, galas, conferences, and corporate events. Guests scan a 
                QR code upon arrival to instantly locate their assigned seat.
              </p>
              
              <p>
                Track arrivals in real-time, see which connections have checked in, 
                and create a more cohesive event experience. Modern event management 
                for the digital age.
              </p>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="border border-gray-200 p-4 bg-white">
                  <div className="text-xs text-gray-400 mb-1">Feature</div>
                  <div className="text-sm text-gray-900">QR Check-in</div>
                </div>
                <div className="border border-gray-200 p-4 bg-white">
                  <div className="text-xs text-gray-400 mb-1">Feature</div>
                  <div className="text-sm text-gray-900">Live Tracking</div>
                </div>
                <div className="border border-gray-200 p-4 bg-white">
                  <div className="text-xs text-gray-400 mb-1">Feature</div>
                  <div className="text-sm text-gray-900">Smart Assign</div>
                </div>
              </div>

              <div className="border border-gray-200 p-6 bg-gray-50">
                <div className="text-xs text-gray-400 mb-2">Contact</div>
                <a 
                  href="tel:417-893-0047" 
                  className="text-2xl font-light tracking-tight text-black hover:text-lime-600 transition-colors"
                >
                  417-893-0047
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className="flex items-center justify-center py-20 px-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="border border-gray-200 bg-white p-12 shadow-sm">
            <div className="mb-10">
              <h2 className="text-3xl font-light tracking-tight text-black mb-2">
                Sign in
              </h2>
              <p className="text-gray-500 text-sm">Access your dashboard</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs text-gray-500 mb-3 uppercase tracking-wider">
                  Username
                </label>
                <input
                  name="email"
                  required
                  className="block w-full bg-white border border-gray-300 px-4 py-3 text-black placeholder-gray-400 focus:border-lime-500 focus:outline-none transition-colors"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-xs text-gray-500 mb-3 uppercase tracking-wider">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full bg-white border border-gray-300 px-4 py-3 text-black placeholder-gray-400 focus:border-lime-500 focus:outline-none transition-colors"
                  placeholder="Enter password"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-lime-500 text-white font-medium hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Processing..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}