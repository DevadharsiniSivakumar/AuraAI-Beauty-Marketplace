'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Mail, ChevronLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate email dispatch
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-rosegold-50 dark:bg-charcoal-950">
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
          Reset password
        </h2>
        <p className="mt-2 text-sm text-charcoal-550 dark:text-rosegold-200">
          We will send you a luxury secure link to restore access.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/80 dark:bg-charcoal-900/80 border border-rosegold-200 dark:border-charcoal-850 py-8 px-6 sm:px-10 rounded-2xl shadow-xl backdrop-blur-md">
          {!isSubmitted ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 placeholder-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                    placeholder="name@example.com"
                  />
                </div>
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
                      Send Reset Instructions
                      <ArrowRight className="ml-2 w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center text-rosegold-500 mb-2">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white">Email Sent</h3>
              <p className="text-sm text-charcoal-500 dark:text-rosegold-350">
                Check your inbox at <span className="font-semibold">{email}</span>. We sent a link to reset your password.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-rosegold-200 dark:border-charcoal-800 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-xs font-semibold text-charcoal-550 dark:text-rosegold-350 hover:text-rosegold-550 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
