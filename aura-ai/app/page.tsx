'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { salons } = useApp();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/salons?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(searchLocation)}`);
  };

  // Categories with their semantic colors
  const categories = [
    { name: 'Hair', color: 'bg-plum/10', textColor: 'text-plum' },
    { name: 'Skin', color: 'bg-coral/10', textColor: 'text-coral' },
    { name: 'Bridal', color: 'bg-rose/10', textColor: 'text-rose' },
    { name: 'Nails', color: 'bg-lavender/10', textColor: 'text-lavender' },
    { name: 'Spa', color: 'bg-sage/10', textColor: 'text-sage' },
    { name: 'Premium', color: 'bg-gold/10', textColor: 'text-gold' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-warmwhite">
      <Navbar />

      <main className="flex-grow">
        {/* A. HERO */}
        <section className="bg-cream pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 border-b border-border">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
            
            {/* Left 55% */}
            <div className="w-full md:w-[55%] flex flex-col items-start space-y-6">
              <span className="inline-block px-3 py-1 bg-white border border-border rounded-full text-xs font-semibold text-mutedtext tracking-wide uppercase">
                Beauty services in Bangalore
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-[56px] leading-tight text-darktext">
                Find the right place for your next appointment.
              </h1>
              <p className="text-lg text-mutedtext max-w-lg leading-relaxed">
                Explore salons, compare services and get recommendations based on what matters to you.
              </p>
              
              {/* Search Module */}
              <form onSubmit={handleSearch} className="w-full max-w-xl bg-white p-2 rounded-lg border border-border shadow-sm flex flex-col sm:flex-row gap-2 mt-4">
                <input 
                  type="text" 
                  placeholder="Service or salon" 
                  className="flex-grow px-4 py-3 bg-transparent text-darktext placeholder-mutedtext focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="hidden sm:block w-[1px] bg-border my-2"></div>
                <input 
                  type="text" 
                  placeholder="Area" 
                  className="w-full sm:w-32 px-4 py-3 bg-transparent text-darktext placeholder-mutedtext focus:outline-none"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
                <button type="submit" className="bg-darktext text-warmwhite px-6 py-3 rounded-md font-medium hover:bg-plum transition-colors">
                  Search
                </button>
              </form>

              {/* Popular Searches */}
              <div className="flex flex-wrap gap-3 mt-2 items-center text-sm">
                <span className="text-mutedtext">Popular:</span>
                {['Haircut', 'Facial', 'Bridal Makeup', 'Hair Spa'].map((term) => (
                  <button key={term} onClick={() => setSearchQuery(term)} className="text-plum hover:underline">
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Right 45% */}
            <div className="w-full md:w-[45%] relative h-[400px] md:h-[500px]">
              {/* Main Image Placeholder */}
              <div className="absolute top-0 right-0 w-[85%] h-[90%] bg-border-dark rounded-lg overflow-hidden shadow-sm">
                {/* Simulated image content */}
                <div className="w-full h-full bg-sage flex items-center justify-center opacity-30">
                  <span className="text-sage text-opacity-80 font-medium">Salon Interior</span>
                </div>
              </div>
              {/* Supporting Image Placeholder */}
              <div className="absolute bottom-0 left-0 w-[55%] h-[45%] bg-white rounded-lg p-2 shadow-sm border border-border">
                <div className="w-full h-full bg-peach flex items-center justify-center rounded overflow-hidden opacity-40">
                  <span className="text-peach text-opacity-80 font-medium text-sm">Stylist</span>
                </div>
              </div>
              {/* Real Data Element */}
              <div className="absolute top-8 left-0 bg-white border border-border px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm font-semibold text-darktext">{salons.length}+ salons listed</span>
              </div>
            </div>

          </div>
        </section>

        {/* B. CATEGORY EXPLORATION */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-warmwhite max-w-7xl mx-auto border-b border-border">
          <div className="flex justify-between items-end mb-10">
            <h2 className="font-serif text-3xl text-darktext">Browse by service</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <Link key={cat.name} href={`/salons?category=${cat.name.toLowerCase()}`} className="group flex flex-col gap-3">
                <div className={`w-full aspect-square rounded-lg ${cat.color} flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02] border border-border`}>
                  {/* Subtle visual area instead of identical icons */}
                  <div className={`w-12 h-12 rounded-full bg-white opacity-50`}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${cat.textColor}`}>{cat.name}</span>
                  {/* Fake count just for layout realism, but using length to imply data */}
                  <span className="text-xs text-mutedtext">{12 + i * 3}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* C. FEATURED SALONS */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blush/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <h2 className="font-serif text-3xl text-darktext">Popular salons</h2>
              <Link href="/salons" className="text-sm font-medium text-plum hover:underline">View all</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {salons.slice(0, 3).map((salon) => (
                <Link key={salon.id} href={`/salons/${salon.id}`} className="group block bg-white rounded-lg border border-border overflow-hidden hover:border-plum transition-colors duration-200">
                  <div className="aspect-[4/3] bg-border-dark relative overflow-hidden">
                    <div className="absolute inset-0 bg-sage opacity-20 group-hover:scale-105 transition-transform duration-500"></div>
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-darktext">
                      {salon.services[0]?.category || 'Hair & Beauty'}
                    </div>
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-mutedtext hover:text-rose transition-colors shadow-sm">
                      ♡
                    </button>
                  </div>
                  <div className="p-5 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg text-darktext">{salon.name}</h3>
                      <div className="flex items-center gap-1 bg-cream px-2 py-0.5 rounded text-sm">
                        <span className="text-gold">★</span>
                        <span className="font-medium">{salon.rating}</span>
                        <span className="text-mutedtext text-xs">({salon.reviewsCount})</span>
                      </div>
                    </div>
                    <p className="text-sm text-mutedtext">{salon.location}</p>
                    <div className="mt-2 pt-3 border-t border-border flex justify-between items-center">
                      <p className="text-sm text-darktext line-clamp-1">{salon.services[0]?.name}</p>
                      <span className="text-sm font-medium">₹{salon.services[0]?.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* D. DISCOVERY STRIP */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-warmwhite max-w-7xl mx-auto">
          <h3 className="text-lg font-medium text-darktext mb-6">Planning for something special?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Wedding', bg: 'bg-rose/20', text: 'text-rose-dark' },
              { title: 'Party', bg: 'bg-lavender/20', text: 'text-plum' },
              { title: 'Photoshoot', bg: 'bg-coral/20', text: 'text-coral' },
              { title: 'Self-care day', bg: 'bg-sage/20', text: 'text-sage' }
            ].map(plan => (
              <Link key={plan.title} href="/journey" className={`${plan.bg} ${plan.text} p-6 rounded-lg font-medium hover:opacity-80 transition-opacity`}>
                {plan.title}
              </Link>
            ))}
          </div>
        </section>

        {/* E. AURA ASSISTANT */}
        <section className="bg-plum py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 flex flex-col items-start gap-6">
              <h2 className="font-serif text-3xl md:text-4xl text-warmwhite">Need help choosing?</h2>
              <p className="text-blush opacity-90 text-lg max-w-md leading-relaxed">
                Tell Aura your budget, preferred area and what you are looking for.
              </p>
              <Link href="/advisor" className="mt-4 bg-warmwhite text-plum px-8 py-3 rounded-md font-medium hover:bg-cream transition-colors">
                Ask Aura
              </Link>
            </div>
            
            <div className="w-full md:w-1/2">
              <div className="bg-warmwhite rounded-lg shadow-xl border border-border p-6 flex flex-col gap-6 w-full max-w-md mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-peach flex items-center justify-center text-white text-xs shrink-0">U</div>
                  <div className="bg-blush p-3 rounded-lg rounded-tl-none text-sm text-darktext">
                    Need a facial under ₹2500 near Indiranagar.
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-plum flex items-center justify-center text-white font-serif italic shrink-0">A</div>
                  <div className="bg-white border border-border p-3 rounded-lg rounded-tl-none text-sm text-darktext">
                    I found a few options that match your budget and area.
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-3 p-2 border border-border rounded">
                        <div className="w-10 h-10 bg-coral/20 rounded"></div>
                        <div>
                          <p className="font-medium text-xs">Glow Skin Clinic</p>
                          <p className="text-[10px] text-mutedtext">Hydrating Facial • ₹2000</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 border border-border rounded">
                        <div className="w-10 h-10 bg-rose/20 rounded"></div>
                        <div>
                          <p className="font-medium text-xs">Aesthetics Studio</p>
                          <p className="text-[10px] text-mutedtext">Deep Cleanse • ₹2400</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* F. PERSONALIZED DISCOVERY */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-warmwhite max-w-7xl mx-auto border-b border-border">
          <div className="mb-10">
            <h2 className="font-serif text-3xl text-darktext">
              {isAuthenticated ? "Based on your preferences" : "Popular near Bangalore"}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {salons.slice(1, 5).map(salon => (
              <Link key={salon.id} href={`/salons/${salon.id}`} className="group flex flex-col gap-3">
                <div className="aspect-square bg-border-dark rounded-lg overflow-hidden border border-border">
                  <div className="w-full h-full bg-peach opacity-20 group-hover:scale-105 transition-transform duration-300"></div>
                </div>
                <div>
                  <h4 className="font-medium text-darktext">{salon.name}</h4>
                  <p className="text-sm text-mutedtext line-clamp-1">{salon.services[0]?.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* G. HOW IT WORKS */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-cream">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-3xl text-darktext text-center mb-16">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              
              <div className="flex flex-col gap-4 relative md:mt-0">
                <span className="font-serif text-6xl text-plum opacity-20 absolute -top-8 -left-4 z-0">1</span>
                <div className="z-10 bg-white w-12 h-12 rounded-full flex items-center justify-center border border-border shadow-sm mb-2">
                  <span className="text-xl">🔍</span>
                </div>
                <h3 className="font-medium text-xl text-darktext z-10">Search</h3>
                <p className="text-mutedtext leading-relaxed z-10 text-sm">
                  Find salons and services using natural language or structured filters.
                </p>
              </div>

              <div className="flex flex-col gap-4 relative md:mt-12">
                <span className="font-serif text-6xl text-plum opacity-20 absolute -top-8 -left-4 z-0">2</span>
                <div className="z-10 bg-white w-12 h-12 rounded-full flex items-center justify-center border border-border shadow-sm mb-2">
                  <span className="text-xl">⚖️</span>
                </div>
                <h3 className="font-medium text-xl text-darktext z-10">Compare</h3>
                <p className="text-mutedtext leading-relaxed z-10 text-sm">
                  View pricing, verified reviews, and proximity side-by-side.
                </p>
              </div>

              <div className="flex flex-col gap-4 relative md:mt-24">
                <span className="font-serif text-6xl text-plum opacity-20 absolute -top-8 -left-4 z-0">3</span>
                <div className="z-10 bg-white w-12 h-12 rounded-full flex items-center justify-center border border-border shadow-sm mb-2">
                  <span className="text-xl">✨</span>
                </div>
                <h3 className="font-medium text-xl text-darktext z-10">Book</h3>
                <p className="text-mutedtext leading-relaxed z-10 text-sm">
                  Confirm your appointment instantly and manage it from your profile.
                </p>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
