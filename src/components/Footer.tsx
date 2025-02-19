import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-zinc-900 py-6 sm:py-8 border-t border-zinc-100 dark:border-zinc-800">
      <div className="mx-16 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        {/* Logo Section */}
        <Link
          href="https://devkins.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 underline underline-offset-2"
        >
          Design by: Devkins Private Limited Pakistan
        </Link>
        <div className="flex items-center text-center sm:text-left">
          <span className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-white tracking-tight">
            Seat Booking System
          </span>
        </div>

        {/* Info Section */}
        <div className="flex flex-col items-center sm:items-end ">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span>© 2025</span>
            <p className="font-semibold text-black dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors duration-200 text-center sm:text-right">
              Created by Jodel Aristilde (2BrothersMovement)
            </p>
          </div>

          <div className="flex flex-row gap-[50px] font-light text-sm">
            <p>seating4you@gmail.com</p>
            <p>(417) 893-0047</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
