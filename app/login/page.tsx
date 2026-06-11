'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('rhea.sen@auraai.in');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth check
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-rosegold-50 dark:bg-charcoal-950">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-linear-to-tr from-rosegold-200/20 to-gold-light/35 blur-3xl -z-10 animate-pulse-slow"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2 mb-6">
          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-rosegold-500 to-gold-metallic flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <span className="text-2xl font-semibold tracking-wide bg-linear-to-r from-charcoal-900 to-rosegold-700 dark:from-rosegold-100 dark:to-gold-medium bg-clip-text text-transparent">
            AuraAI
          </span>
        </Link>
        <h2 className="text-3xl font-bold text-charcoal-950 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-charcoal-550 dark:text-rosegold-200">
          Or{' '}
          <Link href="/register" className="font-medium text-rosegold-500 hover:text-rosegold-600 transition-colors">
            create a new beauty profile
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/80 dark:bg-charcoal-900/80 border border-rosegold-200 dark:border-charcoal-850 py-8 px-6 sm:px-10 rounded-2xl shadow-xl backdrop-blur-md">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 dark:text-rosegold-200 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 placeholder-charcoal-400 dark:placeholder-charcoal-600 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 dark:text-rosegold-200">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-rosegold-500 hover:text-rosegold-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 placeholder-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded-md border-rosegold-300 text-rosegold-550 focus:ring-rosegold-550 dark:bg-charcoal-950 dark:border-charcoal-800"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-charcoal-550 dark:text-rosegold-350">
                Remember my concierge session
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-rosegold-500 to-gold-metallic hover:from-rosegold-600 hover:to-gold-dark shadow-md hover:scale-101 focus:outline-hidden transition-all disabled:opacity-50 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="flex items-center">
                    Sign In
                    <ArrowRight className="ml-2 w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
