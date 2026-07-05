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
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FCFAF8]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block text-2xl font-bold text-[#2D2926] mb-6">
          Aura
        </Link>
        <h2 className="text-2xl font-bold text-[#2D2926]">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-[#716A65]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#9D5965] hover:underline">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] border border-[#E5DED8] py-8 px-6 sm:px-10 rounded-md">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSignup}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#2D2926] mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5DED8] rounded-md bg-[#FCFAF8] text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
                placeholder="Your Full Name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2D2926] mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5DED8] rounded-md bg-[#FCFAF8] text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2D2926] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5DED8] rounded-md bg-[#FCFAF8] text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
                placeholder="Create password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-[#2D2926] text-white rounded-md text-sm font-medium hover:bg-[#1a1715] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
