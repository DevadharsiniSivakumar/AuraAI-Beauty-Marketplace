'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white max-w-4xl mx-auto">
            Find beauty services that suit you.
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore salons, compare services and get personalized suggestions with Aura.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              href="/salons"
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Explore Salons
            </Link>
            <Link
              href="/concierge"
              className="w-full sm:w-auto px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors"
            >
              Ask Aura
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">Popular Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {['Hair Care', 'Skin Care', 'Bridal', 'Nails', 'Spa'].map((service, idx) => (
              <div key={idx} className="p-4 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-black font-medium text-gray-700 dark:text-gray-300">
                {service}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Aura Helps */}
      <section className="py-16 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">How Aura Helps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-md">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Find Salons</h3>
              <p className="text-gray-600 dark:text-gray-400">Discover highly rated wellness clinics and salons near your location.</p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-md">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Compare Options</h3>
              <p className="text-gray-600 dark:text-gray-400">View real customer feedback, services, and pricing to make an informed choice.</p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-md">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Get Suggestions</h3>
              <p className="text-gray-600 dark:text-gray-400">Receive personalized recommendations for styles and treatments tailored to you.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
