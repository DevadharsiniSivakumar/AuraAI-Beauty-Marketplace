'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('user@auraai.com');
  const [password, setPassword] = useState('password');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const session = await login(email, password);
      if (session.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-warmwhite">
      
      {/* Left 40%: Image Area (Desktop Only) */}
      <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden border-r border-border items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/login-bg.png" 
          alt="Aura Beauty Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-plum/10 mix-blend-multiply"></div>
        
        <div className="relative z-10 p-12 mt-auto w-full bg-gradient-to-t from-plum/80 to-transparent">
          <Link href="/" className="inline-block text-3xl font-serif font-bold text-warmwhite mb-4">
            Aura
          </Link>
          <p className="text-warmwhite/90 font-medium text-lg leading-relaxed max-w-sm">
            Discover salons, book treatments, and manage your beauty journey with ease.
          </p>
        </div>
      </div>

      {/* Right 60%: Form Area */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-32">
        <div className="w-full max-w-sm mx-auto lg:mx-0">
          
          <div className="lg:hidden mb-10">
            <Link href="/" className="inline-block text-3xl font-serif font-bold text-darktext">
              Aura
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-serif text-darktext mb-2">Welcome back</h2>
            <p className="text-mutedtext">Enter your details to sign in to your account.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-rose/10 text-rose-dark text-sm border border-rose/20 flex items-start gap-3">
              <span className="text-rose">!</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-darktext mb-1.5">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-cream text-darktext focus:outline-none focus:border-plum transition-colors"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-darktext">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium text-plum hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-cream text-darktext focus:outline-none focus:border-plum transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-plum text-warmwhite rounded-lg font-medium hover:bg-plum-dark transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-mutedtext">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-plum hover:underline">
              Create one
            </Link>
          </p>

          <div className="mt-6 p-4 rounded-xl bg-cream border border-border text-left">
            <p className="text-xs font-bold text-darktext mb-1.5 flex items-center gap-1.5">
              <span>💡</span> Standard User Demo Credentials:
            </p>
            <div className="space-y-1 font-mono text-[11px] text-mutedtext bg-warmwhite p-2 rounded border border-border">
              <p>Email: <span className="font-semibold select-all text-darktext">user@auraai.com</span></p>
              <p>Password: <span className="font-semibold select-all text-darktext">password</span></p>
            </div>
            <p className="text-[10px] text-mutedtext mt-2 leading-relaxed">
              Use these credentials to sign in as a standard client to browse, book, and review salons.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link 
              href="/admin/login" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-plum hover:text-plum-dark transition-colors"
            >
              <span>🛡️</span> Are you an Administrator? Access Admin Portal
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
