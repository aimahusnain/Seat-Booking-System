import Link from "next/link";
import React from "react";
import Image from 'next/image'

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-zinc-900 py-6 sm:py-8 border-t border-zinc-100 dark:border-zinc-800">
      <div className="mx-4 sm:mx-16">
        {/* Mobile Layout - Modern, Card-like Design */}
        <div className="sm:hidden flex flex-col gap-8">
          {/* Brand Name for Mobile */}
          <div className="text-center">
          <Link href="/" className="flex justify-center items-center space-x-2">
      <Image src="/logo.svg" alt="Seating4U Logo" width={150} height={80} />
    </Link>
          </div>

          {/* Contact Info Card for Mobile */}
          <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col gap-3 items-center">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">seating4you@gmail.com</p>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">(417) 893-0047</p>
            </div>
          </div>

          {/* Credits for Mobile */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-semibold text-black dark:text-white">
                Created by Jodel Aristilde
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">(2BrothersMovement)</p>
            </div>
            
            <Link
              href="https://devkins.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 underline underline-offset-2"
            >
              Design by: Devkins Private Limited Pakistan
            </Link>
            
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">© 2025</p>
          </div>
        </div>

        {/* Desktop Layout - Unchanged */}
        <div className="hidden sm:flex flex-row items-center justify-between gap-6">
          <Link
            href="https://devkins.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 underline underline-offset-2"
          >
            Design by: Devkins Private Limited Pakistan
          </Link>

          <div className="flex items-center text-left">
          <Link href="/" className="flex justify-center items-center space-x-2">
      <Image src="/logo.svg" alt="Seating4U Logo" width={180} height={100} />
    </Link>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex flex-row items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span>© 2025</span>
              <p className="font-semibold text-black dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors duration-200 text-right">
                Created by Jodel Aristilde (2BrothersMovement)
              </p>
            </div>

            <div className="flex flex-row gap-[50px] font-light text-sm">
              <p>seating4you@gmail.com</p>
              <p>(417) 893-0047</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;