'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Moon, Sun, Menu, X, User, Shield, LogOut } from 'lucide-react';

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
      // Redirect based on current role
      if (role === 'admin') {
        router.push('/admin/login');
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Compile navigation links dynamically based on role/auth state
  let navLinks: { name: string; href: string }[] = [];
  if (user) {
    if (role === 'user') {
      navLinks = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'AI Concierge', href: '/concierge' },
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
    <nav className="sticky top-0 z-50 w-full border-b border-rosegold-200/50 dark:border-charcoal-800/50 glass transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-[#0c051a] flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-300 border border-rosegold-300/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/logo.jpg" 
                  alt="Aura Logo" 
                  className="w-full h-full object-cover scale-[1.7] transform" 
                />
              </div>
              <span className="text-2xl font-semibold tracking-wide bg-linear-to-r from-charcoal-900 to-rosegold-700 dark:from-rosegold-100 dark:to-gold-medium bg-clip-text text-transparent font-playfair">
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
                className={`text-sm font-medium tracking-wide transition-colors hover:text-rosegold-500 ${
                  isActive(link.href)
                    ? 'text-rosegold-600 dark:text-gold-medium border-b-2 border-rosegold-500 dark:border-gold-medium pb-1 pt-1'
                    : 'text-charcoal-600 dark:text-rosegold-200'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-charcoal-600 dark:text-rosegold-200 hover:bg-rosegold-100/50 dark:hover:bg-charcoal-800 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                {/* User Session Detail */}
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full border border-rosegold-300 dark:border-rosegold-800 bg-rosegold-100/30 dark:bg-charcoal-900 text-sm font-medium text-charcoal-800 dark:text-rosegold-100">
                  <User className="w-4 h-4 text-rosegold-500" />
                  <span>{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] uppercase tracking-wider bg-rosegold-200 dark:bg-charcoal-800 px-1.5 py-0.5 rounded-sm font-bold text-rosegold-600 dark:text-gold-medium ml-1">
                    {role}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-charcoal-600 dark:text-rosegold-200 hover:text-rosegold-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic hover:from-rosegold-600 hover:to-gold-dark text-white text-xs font-semibold shadow-md hover:scale-102 transition-all"
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
              className="p-2 rounded-full text-charcoal-600 dark:text-rosegold-200"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-charcoal-600 dark:text-rosegold-200 hover:bg-rosegold-100/50 dark:hover:bg-charcoal-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-rosegold-200/50 dark:border-charcoal-800 bg-white/95 dark:bg-charcoal-950/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 shadow-lg animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.href)
                  ? 'bg-rosegold-100 dark:bg-charcoal-800 text-rosegold-600 dark:text-gold-medium'
                  : 'text-charcoal-700 dark:text-rosegold-200 hover:bg-rosegold-50 dark:hover:bg-charcoal-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-rosegold-200 dark:border-charcoal-800 flex flex-col space-y-2">
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 text-charcoal-600 dark:text-rosegold-350 text-sm">
                  <User className="w-4 h-4 text-rosegold-500" />
                  <span>Logged in as <strong>{user.name}</strong> ({role})</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center space-x-2 px-3 py-2 rounded-full border border-red-200 dark:border-red-950/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-base font-medium transition-colors cursor-pointer"
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
                  className="flex justify-center items-center py-2.5 px-4 rounded-full border border-rosegold-300 dark:border-charcoal-800 text-charcoal-700 dark:text-rosegold-200 text-sm font-medium hover:bg-rosegold-50 dark:hover:bg-charcoal-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center py-2.5 px-4 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic text-white text-sm font-semibold shadow-md"
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
