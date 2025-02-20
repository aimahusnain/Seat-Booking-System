import Footer from "@/components/Footer";
import ToasterProvider from "@/providers/toaster-provider";
import AuthProvider from "@/providers/auth-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/providers/auth-guard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seating4you",
  description:
    "A seat booking application to manage and reserve seats efficiently.",
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
        <AuthProvider>
          <AuthGuard>
            <ToasterProvider />
            {children}
            <Footer />
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
