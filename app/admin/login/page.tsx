'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Mail, Lock, ShieldAlert, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('admin@auraai.com');
  const [password, setPassword] = useState('password');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await loginAdmin(email, password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-rosegold-50 dark:bg-charcoal-950">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-linear-to-tr from-charcoal-800/10 to-gold-metallic/20 blur-3xl -z-10 animate-pulse-slow"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-3 mb-6">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#0c051a] flex items-center justify-center shadow-md border border-rosegold-300/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.jpg" 
              alt="Aura Logo" 
              className="w-full h-full object-cover scale-[1.7] transform" 
            />
          </div>
          <span className="text-2xl font-semibold tracking-wide bg-linear-to-r from-charcoal-900 to-rosegold-700 dark:from-rosegold-100 dark:to-gold-medium bg-clip-text text-transparent font-playfair">
            Aura Admin
          </span>
        </Link>
        <h2 className="text-3xl font-bold text-charcoal-950 dark:text-white font-playfair">
          Administrator Login
        </h2>
        <p className="mt-2 text-sm text-charcoal-550 dark:text-rosegold-350">
          Enter administrative credentials to access the console.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/80 dark:bg-charcoal-900/80 border border-charcoal-350 dark:border-charcoal-800 py-8 px-6 sm:px-10 rounded-2xl shadow-xl backdrop-blur-md">
          {errorMsg && (
            <div className={`mb-4 p-3 rounded-xl border text-xs flex items-center space-x-2 ${
              errorMsg === 'Unauthorized Access'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-450 font-bold'
                : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-650 dark:text-red-400'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleAdminLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 dark:text-rosegold-200 mb-1.5">
                Admin Email
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
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-charcoal-300 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 placeholder-charcoal-400 dark:placeholder-charcoal-600 focus:outline-hidden focus:ring-1 focus:ring-charcoal-900 text-charcoal-900 dark:text-white"
                  placeholder="admin@auraai.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 dark:text-rosegold-200">
                  Password
                </label>
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
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-charcoal-300 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 placeholder-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-charcoal-900 text-charcoal-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-charcoal-900 hover:bg-charcoal-950 dark:bg-rosegold-600 dark:hover:bg-rosegold-700 shadow-md hover:scale-101 focus:outline-hidden transition-all disabled:opacity-50 group cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="flex items-center">
                    Enter Admin Console
                    <ArrowRight className="ml-2 w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-rosegold-250 dark:border-charcoal-800 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-rosegold-550 hover:text-rosegold-600 transition-colors"
            >
              Back to standard user login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
