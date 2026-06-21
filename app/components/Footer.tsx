'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Heart, Check, Loader2 } from 'lucide-react';
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
        // Simulated Local Storage persistence
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
    <footer className="border-t border-rosegold-200/50 dark:border-charcoal-800 bg-white/50 dark:bg-charcoal-950/50 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-rosegold-550 to-gold-metallic flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-semibold tracking-wide bg-linear-to-r from-charcoal-900 to-rosegold-700 dark:from-rosegold-100 dark:to-gold-medium bg-clip-text text-transparent font-playfair">
                AuraAI
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-charcoal-550 dark:text-rosegold-300 leading-relaxed font-light">
              A scalable AI Beauty Concierge Platform providing personalized style advice, automated review analysis, beauty journey planning, and salon booking management.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-semibold text-charcoal-800 dark:text-rosegold-200 uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/concierge" className="text-sm text-charcoal-600 dark:text-rosegold-350 hover:text-rosegold-500 transition-colors">
                  AI Concierge Chat
                </Link>
              </li>
              <li>
                <Link href="/advisor" className="text-sm text-charcoal-600 dark:text-rosegold-350 hover:text-rosegold-500 transition-colors">
                  Style & Selfie Advisor
                </Link>
              </li>
              <li>
                <Link href="/salons" className="text-sm text-charcoal-600 dark:text-rosegold-350 hover:text-rosegold-500 transition-colors">
                  Discover Salons
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-sm text-charcoal-600 dark:text-rosegold-350 hover:text-rosegold-500 transition-colors">
                  Review Intelligence
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Company Column */}
          <div>
            <h4 className="text-xs font-semibold text-charcoal-800 dark:text-rosegold-200 uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-charcoal-600 dark:text-rosegold-350 hover:text-rosegold-500 transition-colors">
                  Client Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-charcoal-600 dark:text-rosegold-350 hover:text-rosegold-500 transition-colors">
                  Partner / Admin Area
                </Link>
              </li>
              <li>
                <span className="text-sm text-charcoal-400 dark:text-charcoal-500 cursor-not-allowed">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-sm text-charcoal-400 dark:text-charcoal-500 cursor-not-allowed">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-charcoal-800 dark:text-rosegold-200 uppercase tracking-widest">Join the Club</h4>
            <p className="text-sm text-charcoal-550 dark:text-rosegold-300 leading-relaxed font-light">
              Get exclusive beauty packages and invitations to preview wellness salons.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
                placeholder={status === 'success' ? "Subscribed!" : "Enter email"}
                className="w-full text-sm px-3 py-2 rounded-lg border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white placeholder-charcoal-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="p-2 rounded-lg bg-rosegold-500 hover:bg-rosegold-600 text-white transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                title="Subscribe"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : status === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </button>
            </form>
            {status === 'success' && (
              <p className="text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold animate-pulse">✓ Thank you for subscribing!</p>
            )}
            {status === 'error' && (
              <p className="text-[11px] text-red-500 font-semibold">✗ Subscription failed. Please try again.</p>
            )}
          </div>

        </div>

        {/* Divider and Copyright */}
        <div className="border-t border-rosegold-200/30 dark:border-charcoal-800/30 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-charcoal-400 dark:text-charcoal-500">
          <p>&copy; {new Date().getFullYear()} AuraAI Technologies Pvt Ltd. All rights reserved.</p>
          <p className="flex items-center mt-2 md:mt-0">
            Handcrafted with <Heart className="w-3.5 h-3.5 text-rosegold-500 mx-1 fill-rosegold-500 animate-pulse" /> by AuraAI
          </p>
        </div>
      </div>
    </footer>
  );
}
