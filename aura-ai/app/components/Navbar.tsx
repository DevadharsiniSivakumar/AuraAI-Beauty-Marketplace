'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const isAdmin = role === 'admin';
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const navLinks = [
    { name: 'Discover', href: '/salons' },
    { name: 'Ask Aura', href: '/advisor' },
    { name: 'My Journey', href: '/journey' },
  ];

  return (
    <header className="bg-warmwhite border-b border-border sticky top-0 z-50 transition-colors h-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="font-serif text-2xl font-bold text-darktext tracking-wide hover:opacity-80 transition-opacity">
            Aura
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-plum ${
                isActive(link.href) ? 'text-plum border-b-2 border-plum' : 'text-mutedtext'
              }`}
              style={{ paddingBottom: '23px', marginTop: '25px' }} // Align active border to bottom of header
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Mock Search Icon */}
          <button className="text-mutedtext hover:text-plum transition-colors" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {user ? (
            <div className="flex items-center space-x-4">
              {isAdmin ? (
                <Link href="/admin" className={`text-sm font-medium transition-colors hover:text-plum ${isActive('/admin') ? 'text-plum' : 'text-mutedtext'}`}>
                  Admin Console
                </Link>
              ) : (
                <Link href="/dashboard" className={`text-sm font-medium transition-colors hover:text-plum ${isActive('/dashboard') ? 'text-plum' : 'text-mutedtext'}`}>
                  Bookings
                </Link>
              )}
              <Link href="/profile" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 rounded-full bg-peach flex items-center justify-center text-warmwhite font-medium text-sm group-hover:opacity-90 transition-opacity">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-mutedtext hover:text-plum transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-darktext hover:text-plum transition-colors">
                Login
              </Link>
              <Link href="/signup" className="text-sm font-medium bg-plum text-warmwhite px-4 py-2 rounded-md hover:bg-plum-dark transition-colors">
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-darktext hover:text-plum focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-warmwhite border-b border-border absolute w-full left-0 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  isActive(link.href) ? 'text-plum bg-blush' : 'text-darktext hover:bg-blush hover:text-plum'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="border-t border-border mt-4 pt-4">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-mutedtext mb-2">Logged in as {user.email}</div>
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      className="block px-3 py-3 rounded-md text-base font-medium text-darktext hover:bg-blush hover:text-plum"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Console
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="block px-3 py-3 rounded-md text-base font-medium text-darktext hover:bg-blush hover:text-plum"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Bookings
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block px-3 py-3 rounded-md text-base font-medium text-darktext hover:bg-blush hover:text-plum"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-500 hover:bg-red-50/50 hover:text-red-650 cursor-pointer"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-3 pt-2">
                  <Link
                    href="/login"
                    className="block w-full text-center py-2 text-darktext border border-border rounded-md font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full text-center py-2 bg-plum text-warmwhite rounded-md font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
