'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signup(name, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      setErrorMsg(err.message || 'Failed to create account. Please try again.');
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
            Join thousands discovering their perfect beauty regimen today.
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
            <h2 className="text-3xl font-serif text-darktext mb-2">Create an account</h2>
            <p className="text-mutedtext">Join Aura to start managing your beauty journey.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-rose/10 text-rose-dark text-sm border border-rose/20 flex items-start gap-3">
              <span className="text-rose">!</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-darktext mb-1.5">Full Name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-cream text-darktext focus:outline-none focus:border-plum transition-colors"
                placeholder="Your name"
              />
            </div>

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
              <label htmlFor="password" className="block text-sm font-medium text-darktext mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-cream text-darktext focus:outline-none focus:border-plum transition-colors"
                placeholder="Create a password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-plum text-warmwhite rounded-lg font-medium hover:bg-plum-dark transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-mutedtext">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-plum hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
