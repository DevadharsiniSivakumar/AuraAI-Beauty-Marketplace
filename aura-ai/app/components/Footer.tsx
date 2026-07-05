'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Check, Loader2 } from 'lucide-react';
import { db, IS_MOCK } from '../../lib/firebase';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      if (IS_MOCK) {
        const existing = localStorage.getItem('aura_newsletter_subscribers');
        const list = existing ? JSON.parse(existing) : [];
        list.push({ email, subscribedAt: new Date().toISOString() });
        localStorage.setItem('aura_newsletter_subscribers', JSON.stringify(list));
      } else {
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(db, 'newsletter_subscribers'), {
          email,
          subscribedAt: new Date().toISOString()
        });
      }
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Aura
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Find salons, book appointments, and plan your beauty journey.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/concierge" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Assistant
                </Link>
              </li>
              <li>
                <Link href="/advisor" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Style Advisor
                </Link>
              </li>
              <li>
                <Link href="/salons" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Explore Salons
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Company Column */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Join Newsletter</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Get updates on new salons and features.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
                placeholder={status === 'success' ? "Subscribed!" : "Email address"}
                className="w-full text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="p-2 rounded-md bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : status === 'success' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </button>
            </form>
            {status === 'success' && (
              <p className="text-xs text-green-600 dark:text-green-400">Thank you for subscribing!</p>
            )}
            {status === 'error' && (
              <p className="text-xs text-red-600 dark:text-red-400">Subscription failed. Please try again.</p>
            )}
          </div>

        </div>

        {/* Divider and Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Aura. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
