import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-zinc-900 py-4 md:py-6 lg:py-8 border-t border-zinc-100 dark:border-zinc-800">
      <div className="px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Main Content */}
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            {/* Logo */}
            <Link
              href="https://devkins.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 underline underline-offset-2 text-center md:text-left"
            >
              Design by: Devkins Private Limited Pakistan
            </Link>

            {/* Brand Name */}
            <div className="flex items-center">
              <span className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-white tracking-tight">
                Seat Booking System
              </span>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col items-center gap-4 md:items-end">
            {/* Copyright */}
            <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span>© 2025</span>
              <p className="font-semibold text-black dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors duration-200 text-center md:text-right">
                Created by Jodel Aristilde (2BrothersMovement)
              </p>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-8 font-light text-sm">
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