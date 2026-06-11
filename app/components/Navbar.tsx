'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { Sparkles, Moon, Sun, Menu, X, User, Shield } from 'lucide-react';

export default function Navbar() {
  const { isDarkMode, toggleDarkMode, userProfile } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'AI Concierge', href: '/concierge' },
    { name: 'Style Advisor', href: '/advisor' },
    { name: 'Explore Salons', href: '/salons' },
    { name: 'Reviews', href: '/reviews' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-rosegold-200/50 dark:border-charcoal-800/50 glass transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-full bg-linear-to-tr from-rosegold-500 to-gold-metallic flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-2xl font-semibold tracking-wide bg-linear-to-r from-charcoal-900 to-rosegold-700 dark:from-rosegold-100 dark:to-gold-medium bg-clip-text text-transparent">
                AuraAI
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
              className="p-2 rounded-full text-charcoal-600 dark:text-rosegold-200 hover:bg-rosegold-100/50 dark:hover:bg-charcoal-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Admin link */}
            <Link
              href="/admin"
              className={`p-2 rounded-full text-charcoal-600 dark:text-rosegold-200 hover:bg-rosegold-100/50 dark:hover:bg-charcoal-800 transition-colors ${
                isActive('/admin') ? 'text-rosegold-500' : ''
              }`}
              title="Admin Portal"
            >
              <Shield className="w-5 h-5" />
            </Link>

            {/* User Dashboard / Profile Link */}
            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border border-rosegold-300 dark:border-rosegold-800 bg-rosegold-100/30 dark:bg-charcoal-900 text-sm font-medium text-charcoal-800 dark:text-rosegold-100 hover:bg-rosegold-100 dark:hover:bg-charcoal-800 transition-all ${
                isActive('/dashboard') ? 'border-rosegold-500 ring-2 ring-rosegold-200' : ''
              }`}
            >
              <User className="w-4 h-4 text-rosegold-500" />
              <span>{userProfile.name.split(' ')[0]}</span>
            </Link>
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
        <div className="md:hidden border-b border-rosegold-200/50 dark:border-charcoal-800 bg-white/95 dark:bg-charcoal-950/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 shadow-lg">
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
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-charcoal-700 dark:text-rosegold-200 hover:bg-rosegold-50 dark:hover:bg-charcoal-900"
            >
              <Shield className="w-4 h-4 text-rosegold-500" />
              <span>Admin Dashboard</span>
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic text-white text-base font-medium justify-center shadow-xs"
            >
              <User className="w-4 h-4" />
              <span>{userProfile.name}&apos;s Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
