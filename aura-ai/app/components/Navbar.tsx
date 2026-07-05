'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Menu, X, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { isDarkMode, toggleDarkMode } = useApp();
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

  let navLinks: { name: string; href: string }[] = [];
  if (user) {
    if (role === 'user') {
      navLinks = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Concierge', href: '/concierge' },
        { name: 'Style Advisor', href: '/advisor' },
        { name: 'Explore Salons', href: '/salons' },
        { name: 'Reviews', href: '/reviews' },
        { name: 'Profile', href: '/profile' },
      ];
    } else if (role === 'admin') {
      navLinks = [
        { name: 'Admin Dashboard', href: '/admin/dashboard' },
      ];
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Aura
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-gray-900 dark:hover:text-white ${
                  isActive(link.href)
                    ? 'text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <User className="w-4 h-4" />
                  <span>{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-500"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.href)
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col space-y-2">
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 text-sm">
                  <User className="w-4 h-4" />
                  <span>Logged in as <strong>{user.name}</strong></span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center space-x-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-base font-medium"
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
                  className="flex justify-center items-center py-2 px-4 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center py-2 px-4 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
