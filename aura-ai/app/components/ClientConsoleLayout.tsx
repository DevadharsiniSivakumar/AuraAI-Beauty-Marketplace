'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Heart,
  Compass,
  Camera,
  Scissors,
  MessageSquare,
  LogOut,
  Store,
  TrendingUp,
  Lock,
  User,
  ArrowLeft
} from 'lucide-react';

interface ClientConsoleLayoutProps {
  children: React.ReactNode;
  activeSidebarItem: 'explore' | 'overview' | 'bookings' | 'saved' | 'journey' | 'scanner' | 'planner' | 'concierge' | 'compare' | 'profile';
  headerTitle?: string;
}

export default function ClientConsoleLayout({ children, activeSidebarItem, headerTitle = "Explore Beauty Hub" }: ClientConsoleLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-cream overflow-hidden text-darktext w-full">
      
      {/* Sidebar - Shared design layout */}
      <aside className="w-64 bg-plum text-warmwhite flex flex-col flex-shrink-0 shadow-xl border-r border-plum-dark/40 z-20">
        <div className="h-20 flex items-center px-6 border-b border-plum-dark/50 gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0c051a] flex items-center justify-center border border-rosegold-300/40">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover scale-[1.7]" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-wide text-white">Aura Hub</span>
        </div>
        
        {/* Navigation Sidebar List */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {isAuthenticated ? (
            <>
              <Link 
                href="/dashboard?tab=overview"
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                  activeSidebarItem === 'overview' 
                    ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach font-bold' 
                    : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-peach" />
                Overview
              </Link>

              <Link 
                href="/salons"
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                  activeSidebarItem === 'explore' 
                    ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach font-bold' 
                    : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4 text-peach" />
                Explore Salons
              </Link>

              <Link 
                href="/dashboard?tab=saved"
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                  activeSidebarItem === 'saved' 
                    ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach font-bold' 
                    : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
                }`}
              >
                <Heart className="w-4 h-4 text-peach" />
                Saved Salons
              </Link>

              <Link 
                href="/dashboard?tab=bookings"
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                  activeSidebarItem === 'bookings' 
                    ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach font-bold' 
                    : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 text-peach" />
                My Bookings
              </Link>

              <Link 
                href="/dashboard?tab=journey"
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                  activeSidebarItem === 'journey' 
                    ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach font-bold' 
                    : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4 text-peach" />
                Beauty Journey
              </Link>

              <Link 
                href="/advisor"
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                  activeSidebarItem === 'scanner' 
                    ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach font-bold' 
                    : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4 text-peach animate-pulse" />
                Selfie Scanner
              </Link>

              <Link 
                href="/compare"
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                  activeSidebarItem === 'compare' 
                    ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach font-bold' 
                    : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-peach" />
                Compare Salons
              </Link>
            </>
          ) : (
            <>
              {/* Disabled/Locked items for guests */}
              <div className="pt-4 border-t border-plum-dark/45 my-2"></div>
              {['Overview', 'Explore Salons', 'Saved Salons', 'My Bookings', 'Beauty Journey', 'Selfie Scanner', 'Compare Salons'].map((item) => (
                <Link
                  key={item}
                  href="/login"
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/40 hover:bg-cream/5 hover:text-warmwhite/60 cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <Lock className="w-4 h-4 shrink-0 text-peach/50" />
                    {item}
                  </span>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Sidebar Footer Operations */}
        <div className="p-4 border-t border-plum-dark/50 space-y-1.5 flex-shrink-0">
          <Link 
            href="/"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-warmwhite/75 hover:text-white transition-colors rounded-lg hover:bg-cream/5 text-left"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
          {isAuthenticated && (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose hover:text-rose-dark transition-colors rounded-lg hover:bg-rose/10 text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Log Out Account
            </button>
          )}
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-border flex items-center justify-between px-8 flex-shrink-0 shadow-xs z-10">
          <h2 className="text-xl font-serif font-bold text-darktext capitalize">
            {headerTitle}
          </h2>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-3.5">
              <div className="text-right">
                <p className="text-xs font-bold text-darktext">{userName}</p>
                <p className="text-[10px] text-mutedtext">{user?.email || 'Authenticated client'}</p>
              </div>
              <Link 
                href="/profile"
                className="w-10 h-10 rounded-full bg-plum text-warmwhite flex items-center justify-center font-bold text-sm shadow-md border-2 border-peach hover:scale-105 transition-transform cursor-pointer"
              >
                {userInitials}
              </Link>
            </div>
          ) : (
            <Link 
              href="/login"
              className="px-4 py-2 bg-plum text-warmwhite rounded-lg hover:bg-plum-dark text-xs font-bold transition-all shadow-xs"
            >
              Log In
            </Link>
          )}
        </header>

        {/* Content Workspace */}
        <main className="flex-grow overflow-y-auto bg-cream/40 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
