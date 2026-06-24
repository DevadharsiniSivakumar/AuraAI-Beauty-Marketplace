'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Define route lists
  const isPublicRoute = (path: string) => {
    return (
      path === '/' ||
      path === '/login' ||
      path === '/signup' ||
      path === '/admin/login' ||
      path === '/forgot-password'
    );
  };

  const isAdminRoute = (path: string) => {
    return path === '/admin' || path.startsWith('/admin/');
  };

  const isUserOnlyRoute = (path: string) => {
    // Pages like dashboard, profile, booking, explore-salons, reviews
    return (
      path === '/dashboard' ||
      path === '/profile' ||
      path === '/booking' ||
      path === '/bookings' ||
      path === '/explore-salons' ||
      path === '/salons' ||
      path.startsWith('/salons/') ||
      path === '/concierge' ||
      path === '/advisor'
    );
  };

  useEffect(() => {
    if (loading) return;

    // Route alias handling: redirect /explore-salons to /salons, /bookings to /dashboard
    if (pathname === '/explore-salons') {
      router.push('/salons');
      return;
    }
    if (pathname === '/bookings') {
      router.push('/dashboard');
      return;
    }

    if (!user) {
      // Unauthenticated users
      if (!isPublicRoute(pathname)) {
        if (isAdminRoute(pathname)) {
          router.push('/admin/login');
        } else {
          router.push('/login');
        }
      }
    } else {
      // Authenticated users
      if (role === 'user') {
        // Users cannot access admin routes
        if (isAdminRoute(pathname)) {
          router.push('/dashboard');
        }
        // Redirect from login pages if already logged in
        if (pathname === '/login' || pathname === '/signup' || pathname === '/admin/login') {
          router.push('/dashboard');
        }
      } else if (role === 'admin') {
        // Admins cannot access user dashboard/profile/booking pages
        if (isUserOnlyRoute(pathname)) {
          router.push('/admin/dashboard');
        }
        // Redirect from login pages if already logged in
        if (pathname === '/login' || pathname === '/signup' || pathname === '/admin/login') {
          router.push('/admin/dashboard');
        }
        // Redirect from admin root to admin dashboard
        if (pathname === '/admin') {
          router.push('/admin/dashboard');
        }
      }
    }
  }, [user, role, loading, pathname, router]);

  // Handle loading state display
  if (loading) {
    // Show premium loading screen only on protected pages to avoid flashes on public landing
    if (!isPublicRoute(pathname)) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-rosegold-50 dark:bg-charcoal-950 relative overflow-hidden">
          {/* Ambient glow backgrounds */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-linear-to-tr from-rosegold-200/25 to-gold-light/40 blur-3xl -z-10 animate-pulse-slow"></div>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-16 h-16">
              {/* Outer spinning gradient ring */}
              <div className="absolute inset-0 rounded-full bg-linear-to-tr from-rosegold-500 to-gold-metallic animate-spin duration-3000"></div>
              {/* Inner container shielding the logo from rotation */}
              <div className="absolute inset-[3px] rounded-full overflow-hidden bg-[#0c051a] flex items-center justify-center border border-rosegold-300/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/logo.jpg" 
                  alt="Aura Logo" 
                  className="w-full h-full object-cover scale-[1.7] transform" 
                />
              </div>
            </div>
            <h1 className="text-xl font-semibold bg-linear-to-r from-charcoal-900 to-rosegold-700 dark:from-rosegold-100 dark:to-gold-medium bg-clip-text text-transparent tracking-wide font-playfair animate-pulse">
              Aura
            </h1>
            <p className="text-xs text-charcoal-550 dark:text-rosegold-350 tracking-widest uppercase font-light">
              Securing your salon concierge...
            </p>
          </div>
        </div>
      );
    }
  }

  // Prevent rendering protected pages if checks aren't satisfied yet
  const shouldBlockRender = 
    !loading && 
    ((!user && !isPublicRoute(pathname)) ||
     (user && role === 'user' && isAdminRoute(pathname)) ||
     (user && role === 'admin' && isUserOnlyRoute(pathname)));

  if (shouldBlockRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rosegold-50 dark:bg-charcoal-950">
        <div className="w-8 h-8 border-2 border-rosegold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
