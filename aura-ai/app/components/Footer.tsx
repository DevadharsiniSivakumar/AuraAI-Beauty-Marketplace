import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#E5DED8] bg-[#FCFAF8] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <Link href="/" className="text-lg font-bold text-[#2D2926]">
              Aura
            </Link>
            <p className="text-xs text-[#716A65]">
              Student project for salon discovery and personalized beauty recommendations.
            </p>
          </div>
          
          <div className="flex gap-6 text-sm text-[#716A65]">
            <Link href="/salons" className="hover:text-[#9D5965] transition-colors">
              Salons
            </Link>
            <Link href="/concierge" className="hover:text-[#9D5965] transition-colors">
              Ask Aura
            </Link>
            <Link href="/dashboard" className="hover:text-[#9D5965] transition-colors">
              Bookings
            </Link>
            <Link href="/profile" className="hover:text-[#9D5965] transition-colors">
              Profile
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
