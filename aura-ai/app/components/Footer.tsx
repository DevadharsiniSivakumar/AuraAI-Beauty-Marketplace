import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-plum text-warmwhite py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Column 1: Brand */}
          <div className="col-span-1">
            <h2 className="font-serif text-2xl font-bold mb-4 tracking-wide">Aura</h2>
            <p className="text-sm text-blush opacity-80 leading-relaxed max-w-xs">
              A salon discovery and personalized recommendation platform.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4 text-peach uppercase tracking-wider">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/salons" className="text-sm text-warmwhite hover:text-peach transition-colors opacity-90">
                  Salons
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-sm text-warmwhite hover:text-peach transition-colors opacity-90">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/advisor" className="text-sm text-warmwhite hover:text-peach transition-colors opacity-90">
                  Ask Aura
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Account */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4 text-peach uppercase tracking-wider">Account</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-sm text-warmwhite hover:text-peach transition-colors opacity-90">
                  Bookings
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-warmwhite hover:text-peach transition-colors opacity-90">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Project */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4 text-peach uppercase tracking-wider">Project</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-warmwhite hover:text-peach transition-colors opacity-90">
                  About
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-warmwhite hover:text-peach transition-colors opacity-90">
                  How recommendations work
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-plum-dark text-center md:text-left">
          <p className="text-xs text-blush opacity-60">
            &copy; {new Date().getFullYear()} Aura Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
