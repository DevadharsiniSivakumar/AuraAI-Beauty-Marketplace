'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      if (role === 'admin') {
        router.push('/admin/login');
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Salons', href: '/salons' },
    { name: 'Services', href: '/salons' },
    { name: 'Ask Aura', href: '/concierge' },
  ];

  return (
    <nav className="w-full border-b border-[#E5DED8] bg-[#FCFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo - Left */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight text-[#2D2926]">
              Aura
            </Link>
          </div>

          {/* Desktop Navigation - Center/Right */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm transition-colors hover:text-[#9D5965] ${
                  isActive(link.href)
                    ? 'text-[#2D2926] font-semibold'
                    : 'text-[#716A65] font-normal'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Action Icons - Far Right */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-6">
                {role === 'user' && (
                  <Link href="/dashboard" className="text-sm font-medium text-[#716A65] hover:text-[#9D5965]">
                    Bookings
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <Link href={role === 'admin' ? '/admin/dashboard' : '/profile'} className="flex items-center space-x-2 text-sm text-[#716A65] hover:text-[#2D2926]">
                    <UserIcon className="w-4 h-4" />
                    <span>{user.name.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-1 text-[#716A65] hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#716A65] hover:text-[#2D2926] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-md bg-[#2D2926] text-white text-sm font-medium hover:bg-[#1a1715] transition-colors"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#716A65]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5DED8] bg-[#FFFFFF] px-4 pt-2 pb-6 space-y-3 shadow-sm">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base ${
                isActive(link.href)
                  ? 'bg-[#F5E9EB] text-[#9D5965] font-semibold'
                  : 'text-[#716A65] hover:bg-gray-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-[#E5DED8] flex flex-col space-y-2">
            {user ? (
              <>
                {role === 'user' && (
                  <Link href="/dashboard" className="block px-3 py-2 text-[#716A65] hover:bg-gray-50 rounded-md">Bookings</Link>
                )}
                <Link href={role === 'admin' ? '/admin/dashboard' : '/profile'} className="flex items-center space-x-2 px-3 py-2 text-[#716A65] hover:bg-gray-50 rounded-md">
                  <UserIcon className="w-4 h-4" />
                  <span>Profile ({user.name})</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-[#716A65] hover:bg-gray-50 rounded-md w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center py-2 px-4 rounded-md border border-[#E5DED8] text-[#716A65] text-sm font-medium hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center py-2 px-4 rounded-md bg-[#2D2926] text-white text-sm font-medium"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
