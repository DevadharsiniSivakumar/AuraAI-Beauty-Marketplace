import React from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-rosegold-200/50 dark:border-charcoal-800 bg-white/50 dark:bg-charcoal-950/50 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-rosegold-500 to-gold-metallic flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-semibold tracking-wide bg-linear-to-r from-charcoal-900 to-rosegold-700 dark:from-rosegold-100 dark:to-gold-medium bg-clip-text text-transparent">
                AuraAI
              </span>
            </Link>
            <p className="text-sm text-charcoal-500 dark:text-rosegold-300 leading-relaxed">
              Elevating beauty through intelligence. Bangalore&apos;s premier bespoke beauty planning and salon concierge platform.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-semibold text-charcoal-800 dark:text-rosegold-200 uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/concierge" className="text-sm text-charcoal-600 dark:text-rosegold-300 hover:text-rosegold-500 transition-colors">
                  AI Concierge Chat
                </Link>
              </li>
              <li>
                <Link href="/advisor" className="text-sm text-charcoal-600 dark:text-rosegold-300 hover:text-rosegold-500 transition-colors">
                  Style & Selfie Advisor
                </Link>
              </li>
              <li>
                <Link href="/salons" className="text-sm text-charcoal-600 dark:text-rosegold-300 hover:text-rosegold-500 transition-colors">
                  Discover Salons
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-sm text-charcoal-600 dark:text-rosegold-300 hover:text-rosegold-500 transition-colors">
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
                <Link href="/dashboard" className="text-sm text-charcoal-600 dark:text-rosegold-300 hover:text-rosegold-500 transition-colors">
                  Client Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-charcoal-600 dark:text-rosegold-300 hover:text-rosegold-500 transition-colors">
                  Partner / Admin Area
                </Link>
              </li>
              <li>
                <span className="text-sm text-charcoal-400 dark:text-charcoal-500 cursor-not-allowed">
                  Privacy Policy (Mock)
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
            <p className="text-sm text-charcoal-500 dark:text-rosegold-300 leading-relaxed">
              Get exclusive beauty packages and invitations to preview wellness salons.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center space-x-2">
              <input
                type="email"
                placeholder="Enter email"
                className="w-full text-sm px-3 py-2 rounded-lg border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-rosegold-500 hover:bg-rosegold-600 text-white transition-colors"
                title="Subscribe"
              >
                <Mail className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Divider and Copyright */}
        <div className="border-t border-rosegold-200/30 dark:border-charcoal-800/30 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-charcoal-400 dark:text-charcoal-500">
          <p>&copy; {new Date().getFullYear()} AuraAI Technologies Pvt Ltd. All rights reserved.</p>
          <p className="flex items-center mt-2 md:mt-0">
            Handcrafted with <Heart className="w-3.5 h-3.5 text-rosegold-500 mx-1 fill-rosegold-500 animate-pulse" /> in Bangalore
          </p>
        </div>
      </div>
    </footer>
  );
}
