'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { MOCK_SALONS } from './data/mockData';

export default function LandingPage() {
  const featuredSalons = MOCK_SALONS.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAF8]">
      <Navbar />

      <main className="flex-1">
        {/* B. Practical Search-First Hero */}
        <section className="border-b border-[#E5DED8] bg-[#FFFFFF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col-reverse md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold text-[#2D2926]">
                Find a salon that fits your needs
              </h1>
              <p className="text-base text-[#716A65]">
                Browse salons, compare services and get suggestions based on your preferences.
              </p>

              <div className="bg-[#FCFAF8] p-4 border border-[#E5DED8] rounded-md flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Search service or salon" 
                  className="flex-1 border border-[#E5DED8] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#9D5965]"
                />
                <input 
                  type="text" 
                  placeholder="Area" 
                  className="sm:w-32 border border-[#E5DED8] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#9D5965]"
                />
                <Link href="/salons" className="bg-[#2D2926] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#1a1715] transition-colors text-center">
                  Search
                </Link>
              </div>

              <div className="flex flex-wrap gap-3 pt-2 text-sm text-[#716A65]">
                <span>Quick links:</span>
                {['Haircut', 'Facial', 'Bridal', 'Spa', 'Nails'].map(link => (
                  <Link key={link} href={`/salons?q=${link.toLowerCase()}`} className="hover:text-[#9D5965] underline decoration-[#E5DED8] underline-offset-4">
                    {link}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-5/12 aspect-[4/3] bg-gray-200 rounded-md overflow-hidden border border-[#E5DED8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop" 
                alt="Salon interior" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* C. Browse by Service */}
        <section className="border-b border-[#E5DED8] py-16 bg-[#FCFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-[#2D2926] mb-8">Browse by service</h2>
            <div className="flex flex-wrap gap-4">
              {['Hair', 'Skin', 'Bridal', 'Nails', 'Spa', 'Makeup'].map((service, idx) => (
                <Link 
                  key={idx} 
                  href={`/salons?category=${service.toLowerCase()}`}
                  className="px-6 py-4 bg-[#FFFFFF] border border-[#E5DED8] rounded-md text-[#2D2926] font-medium hover:border-[#9D5965] transition-colors flex-1 min-w-[140px] text-center"
                >
                  {service}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* D. Salons Section */}
        <section className="border-b border-[#E5DED8] py-16 bg-[#FFFFFF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-[#2D2926] mb-8">Salons you can explore</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredSalons.map((salon) => (
                <div key={salon.id} className="border border-[#E5DED8] rounded-md overflow-hidden bg-[#FCFAF8] flex flex-col">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={salon.image} alt={salon.name} className="w-full h-40 object-cover border-b border-[#E5DED8]" />
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <div>
                      <h3 className="font-bold text-[#2D2926]">{salon.name}</h3>
                      <p className="text-xs text-[#716A65]">{salon.locality}</p>
                    </div>
                    <div className="text-sm font-medium text-[#2D2926]">★ {salon.rating}</div>
                    <p className="text-xs text-[#716A65] truncate">
                      {salon.services.slice(0, 3).map(s => s.category).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}
                    </p>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-xs text-[#716A65]">Starting from ₹{Math.min(...salon.services.map(s => s.price))}</span>
                      <Link href={`/salons/${salon.id}`} className="text-xs font-medium text-[#2D2926] underline decoration-[#E5DED8] hover:text-[#9D5965] underline-offset-4">
                        View salon
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* E. Small Aura Assistant Section */}
        <section className="border-b border-[#E5DED8] py-16 bg-[#FCFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-12 items-center bg-[#FFFFFF] border border-[#E5DED8] rounded-md p-8 md:p-12">
              <div className="flex-1 space-y-4">
                <h2 className="text-xl font-bold text-[#2D2926]">Not sure what to choose?</h2>
                <p className="text-sm text-[#716A65]">
                  Tell Aura what service you need, your budget and preferred area.
                </p>
                <Link href="/concierge" className="inline-block mt-4 bg-[#2D2926] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#1a1715] transition-colors">
                  Ask Aura
                </Link>
              </div>
              <div className="flex-1 w-full bg-[#FCFAF8] border border-[#E5DED8] rounded-md p-4 space-y-4 font-mono text-xs">
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-[#716A65] font-sans">You</span>
                  <div className="bg-[#E5DED8] px-3 py-2 rounded-md text-[#2D2926]">
                    I need a facial under ₹2500 near Indiranagar.
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-[#716A65] font-sans">Aura</span>
                  <div className="bg-[#FFFFFF] border border-[#E5DED8] px-3 py-2 rounded-md text-[#2D2926]">
                    I can help you compare suitable options. Here are 2 highly rated salons in Indiranagar within your budget.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* F. Simple How It Works */}
        <section className="py-16 bg-[#FFFFFF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-[#2D2926] mb-8">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2 border-l-2 border-[#E5DED8] pl-4">
                <h3 className="font-bold text-[#2D2926]">1. Search</h3>
                <p className="text-sm text-[#716A65]">Find salons and services.</p>
              </div>
              <div className="space-y-2 border-l-2 border-[#E5DED8] pl-4">
                <h3 className="font-bold text-[#2D2926]">2. Compare</h3>
                <p className="text-sm text-[#716A65]">Check prices, ratings and reviews.</p>
              </div>
              <div className="space-y-2 border-l-2 border-[#E5DED8] pl-4">
                <h3 className="font-bold text-[#2D2926]">3. Book</h3>
                <p className="text-sm text-[#716A65]">Choose an option and send your booking request.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
