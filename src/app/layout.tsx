import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seat Booking System",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        {children}

        <footer className="bg-white dark:bg-zinc-900 py-8 px-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-zinc-800 dark:text-white tracking-tight">
                Seat Booking System
              </span>
            </div>

            <div className="text-center md:text-right">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
                <div className="flex items-center justify-center md:justify-end space-x-2">
                  <span>© 2025</span>
                  <p
                    className="font-semibold text-black transition-colors duration-300"
                  >
                    Create by Jodel Aristilde (2BrothersMovement)
                  </p>
                </div>
                <Link
                  href="https://devkins.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block underline text-zinc-500 hover:text-blue-600 transition-colors duration-300"
                >
                  Design by: Devkins Private Limited Pakistan
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
