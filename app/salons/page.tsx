'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  MapPin, 
  Star, 
  SlidersHorizontal, 
  Sparkles, 
  Home, 
  ChevronRight, 
  Compass,
  CheckCircle
} from 'lucide-react';

export default function ExploreSalons() {
  const { salons } = useApp();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);
  const [budgetFilters, setBudgetFilters] = useState<string[]>([]); // 'low', 'mid', 'high'
  const [luxuryOnly, setLuxuryOnly] = useState(false);
  const [homeServiceOnly, setHomeServiceOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  const localitiesList = [
    'Indiranagar',
    'Koramangala',
    'Vittal Mallya Rd',
    'Jayanagar',
    'HSR Layout',
    'Lavelle Road'
  ];

  const handleLocalityToggle = (locality: string) => {
    setSelectedLocalities(prev => 
      prev.includes(locality) ? prev.filter(l => l !== locality) : [...prev, locality]
    );
  };

  const handleBudgetToggle = (budget: string) => {
    setBudgetFilters(prev => 
      prev.includes(budget) ? prev.filter(b => b !== budget) : [...prev, budget]
    );
  };

  // Perform filtration logic
  const filteredSalons = useMemo(() => {
    return salons.filter(salon => {
      // 1. Search Query Match
      const matchesSearch = 
        salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (salon.services || []).some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Locality Match
      if (selectedLocalities.length > 0 && !selectedLocalities.includes(salon.locality)) {
        return false;
      }

      // 3. Luxury Check
      if (luxuryOnly && !salon.isLuxury) {
        return false;
      }

      // 4. Home Service Check
      if (homeServiceOnly && !salon.offersHomeService) {
        return false;
      }

      // 5. Minimum Rating
      if (salon.rating < minRating) {
        return false;
      }

      // 6. Budget match
      if (budgetFilters.length > 0) {
        const servicesList = salon.services || [];
        const avgPrice = servicesList.length > 0 
          ? servicesList.reduce((acc, s) => acc + s.price, 0) / servicesList.length 
          : 0;
        let category = 'mid';
        if (avgPrice < 2000) category = 'low';
        if (avgPrice > 5000) category = 'high';
        
        if (!budgetFilters.includes(category)) {
          return false;
        }
      }

      return true;
    });
  }, [salons, searchTerm, selectedLocalities, luxuryOnly, homeServiceOnly, minRating, budgetFilters]);

  // Recommended Salons logic (Match score >= 90%)
  const recommendedSalonsList = useMemo(() => {
    return salons.filter(s => s.matchScore >= 90);
  }, [salons]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Top search & title bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-rosegold-200/40 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-950 dark:text-white font-playfair font-playfair">Discover Salons</h1>
            <p className="text-sm text-charcoal-550 dark:text-rosegold-200">Personalized beauty planning matched to your active profile in Bangalore.</p>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search salon or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 placeholder-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-charcoal-400" />
          </div>
        </div>

        {/* SECTION 1: Recommended For You */}
        <section className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-855 bg-linear-to-r from-rosegold-100/30 to-white dark:from-charcoal-900 dark:to-charcoal-950 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-charcoal-950 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rosegold-500" />
                Recommended For You
              </h3>
              <p className="text-xs text-charcoal-450 dark:text-rosegold-300">Based on your Beauty DNA profile, Indiranagar locality, and skincare search queries.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedSalonsList.map((salon) => {
              const servicesList = salon.services || [];
              const startingPrice = servicesList.length > 0 
                ? Math.min(...servicesList.map(s => s.price)) 
                : 0;
              return (
                <div 
                  key={salon.id}
                  className="rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 p-4 flex flex-col justify-between space-y-4 hover:border-rosegold-350 transition-colors shadow-2xs hover:scale-101 duration-300 animate-fade-in"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-linear-to-r from-rosegold-550 to-gold-metallic text-white">
                        {salon.matchScore}% Match
                      </span>
                      <div className="flex text-rosegold-550 text-xs items-center font-bold">
                        <Star className="w-3.5 h-3.5 fill-rosegold-500 mr-0.5" />
                        {salon.rating}
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-charcoal-900 dark:text-white">{salon.name}</h4>
                    <p className="text-xs text-charcoal-400 flex items-center">
                      <MapPin className="w-3 h-3 text-rosegold-500 mr-1" />
                      {salon.locality}
                    </p>
                    
                    <div className="pt-2 border-t border-rosegold-200/40 space-y-1.5 text-[10px] text-charcoal-550 dark:text-rosegold-200">
                      {(salon.badges || []).map((b, bIdx) => (
                        <p key={bIdx} className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          {b}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-rosegold-100 dark:border-charcoal-800">
                    <span className="text-xs text-charcoal-500">
                      {startingPrice > 0 ? `From ₹${startingPrice}` : 'N/A'}
                    </span>
                    <Link
                      href={`/salons/${salon.id}`}
                      className="text-xs font-semibold text-rosegold-500 hover:text-rosegold-650 flex items-center gap-0.5"
                    >
                      Book Agent
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filter Panel */}
          <aside className="lg:col-span-1 p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-855 bg-white dark:bg-charcoal-900 space-y-6 h-fit">
            <div className="flex items-center justify-between border-b border-rosegold-100 dark:border-charcoal-800 pb-3">
              <h3 className="font-bold text-charcoal-950 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                <SlidersHorizontal className="w-4 h-4 text-rosegold-555" />
                Refine Search
              </h3>
              {(selectedLocalities.length > 0 || budgetFilters.length > 0 || luxuryOnly || homeServiceOnly || minRating > 0 || searchTerm !== '') && (
                <button
                  onClick={() => {
                    setSelectedLocalities([]);
                    setBudgetFilters([]);
                    setLuxuryOnly(false);
                    setHomeServiceOnly(false);
                    setMinRating(0);
                    setSearchTerm('');
                  }}
                  className="text-[10px] font-semibold text-rosegold-500 hover:text-rosegold-655 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Neighborhood Checkboxes */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-charcoal-700 dark:text-rosegold-250 uppercase tracking-widest">Neighborhood</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {localitiesList.map((locality) => (
                  <label key={locality} className="flex items-center text-xs text-charcoal-600 dark:text-rosegold-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLocalities.includes(locality)}
                      onChange={() => handleLocalityToggle(locality)}
                      className="rounded-md border-rosegold-300 text-rosegold-500 focus:ring-rosegold-500 mr-2 h-4 w-4 bg-transparent"
                    />
                    {locality}
                  </label>
                ))}
              </div>
            </div>

            {/* Service Type Switch */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-charcoal-700 dark:text-rosegold-250 uppercase tracking-widest">Preferences</h4>
              <div className="space-y-2.5">
                <label className="flex items-center text-xs text-charcoal-600 dark:text-rosegold-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={luxuryOnly}
                    onChange={(e) => setLuxuryOnly(e.target.checked)}
                    className="rounded-md border-rosegold-300 text-rosegold-500 focus:ring-rosegold-500 mr-2 h-4 w-4 bg-transparent"
                  />
                  <Sparkles className="w-3.5 h-3.5 text-rosegold-500 mr-1 shrink-0" />
                  Luxury Brands Only
                </label>
                <label className="flex items-center text-xs text-charcoal-600 dark:text-rosegold-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={homeServiceOnly}
                    onChange={(e) => setHomeServiceOnly(e.target.checked)}
                    className="rounded-md border-rosegold-300 text-rosegold-500 focus:ring-rosegold-500 mr-2 h-4 w-4 bg-transparent"
                  />
                  <Home className="w-3.5 h-3.5 text-rosegold-500 mr-1 shrink-0" />
                  Offers Home Service
                </label>
              </div>
            </div>

            {/* Price Segment Checkbox */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-charcoal-700 dark:text-rosegold-250 uppercase tracking-widest">Average Pricing</h4>
              <div className="space-y-2">
                <label className="flex items-center text-xs text-charcoal-600 dark:text-rosegold-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={budgetFilters.includes('low')}
                    onChange={() => handleBudgetToggle('low')}
                    className="rounded-md border-rosegold-300 text-rosegold-500 focus:ring-rosegold-500 mr-2 h-4 w-4 bg-transparent"
                  />
                  Budget-Friendly (Avg &lt; ₹2000)
                </label>
                <label className="flex items-center text-xs text-charcoal-600 dark:text-rosegold-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={budgetFilters.includes('mid')}
                    onChange={() => handleBudgetToggle('mid')}
                    className="rounded-md border-rosegold-300 text-rosegold-500 focus:ring-rosegold-500 mr-2 h-4 w-4 bg-transparent"
                  />
                  Premium Select (Avg ₹2000 - ₹5000)
                </label>
                <label className="flex items-center text-xs text-charcoal-600 dark:text-rosegold-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={budgetFilters.includes('high')}
                    onChange={() => handleBudgetToggle('high')}
                    className="rounded-md border-rosegold-300 text-rosegold-500 focus:ring-rosegold-500 mr-2 h-4 w-4 bg-transparent"
                  />
                  Ultra-Luxury (Avg &gt; ₹5000)
                </label>
              </div>
            </div>

            {/* Rating selector slider */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-charcoal-700 dark:text-rosegold-250 uppercase tracking-widest">Minimum Rating</h4>
              <div className="flex gap-2">
                {[0, 4.4, 4.6, 4.8].map((ratingVal) => (
                  <button
                    key={ratingVal}
                    onClick={() => setMinRating(ratingVal)}
                    className={`flex-1 text-center py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      minRating === ratingVal 
                        ? 'bg-rosegold-500 border-rosegold-500 text-white font-semibold' 
                        : 'border-rosegold-200 dark:border-charcoal-800 text-charcoal-650 hover:bg-rosegold-50 dark:hover:bg-charcoal-800'
                    }`}
                  >
                    {ratingVal === 0 ? 'All' : `${ratingVal}★`}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* Salons list grid */}
          <section className="lg:col-span-3 space-y-6">
            {filteredSalons.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredSalons.map((salon) => {
                  const servicesList = salon.services || [];
                  const startingPrice = servicesList.length > 0 
                    ? Math.min(...servicesList.map(s => s.price)) 
                    : 0;
                  
                  return (
                    <div 
                      key={salon.id}
                      className="rounded-2xl border border-rosegold-200/60 dark:border-charcoal-855 bg-white dark:bg-charcoal-900 shadow-2xs hover:shadow-md hover:scale-[1.01] hover:border-rosegold-400/50 transition-all flex flex-col justify-between overflow-hidden group duration-300"
                    >
                      {/* Image container */}
                      <div className="relative h-48 w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={salon.image} 
                          alt={salon.name} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3 bg-linear-to-r from-rosegold-550 to-gold-metallic text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                          {salon.matchScore}% Match
                        </div>
                        <div className="absolute top-3 right-3 flex gap-2">
                          {salon.isLuxury && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-linear-to-tr from-charcoal-900 to-charcoal-950 text-rosegold-200 tracking-widest uppercase shadow-sm flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              Luxury
                            </span>
                          )}
                          {salon.offersHomeService && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-charcoal-900/80 text-rosegold-100 backdrop-blur-xs flex items-center gap-1">
                              <Home className="w-2.5 h-2.5" />
                              Home Service
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-charcoal-955 dark:text-white line-clamp-1">{salon.name}</h3>
                            <div className="flex items-center text-rosegold-550 shrink-0 text-sm">
                              <Star className="w-4 h-4 fill-rosegold-500 mr-1" />
                              <span className="font-bold">{salon.rating}</span>
                              <span className="text-[10px] text-charcoal-400 font-light ml-1">({salon.reviewsCount})</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-charcoal-400 flex items-center">
                            <MapPin className="w-3 h-3 text-rosegold-500 mr-1" />
                            {salon.location}
                          </p>

                          {/* Dynamic recommendation badge previews */}
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {(salon.badges || []).map((b, bIdx) => (
                              <span key={bIdx} className="text-[8px] font-bold text-rosegold-500 uppercase tracking-widest bg-rosegold-100/30 dark:bg-charcoal-950 p-1.5 rounded-md">
                                {b}
                              </span>
                            ))}
                          </div>

                          <p className="text-xs text-charcoal-550 dark:text-rosegold-300 font-light leading-relaxed line-clamp-2 pt-1.5">
                            {salon.description}
                          </p>
                        </div>

                        {/* Services preview pill */}
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set((salon.services || []).map(s => s.category))).map(cat => (
                            <span key={cat} className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-rosegold-100/40 dark:bg-charcoal-800 text-charcoal-600 dark:text-rosegold-200">
                              {cat}
                            </span>
                          ))}
                        </div>

                        {/* Card footer details */}
                        <div className="pt-3 border-t border-rosegold-100 dark:border-charcoal-800/80 flex justify-between items-center">
                          <span className="text-xs text-charcoal-550 dark:text-rosegold-350">
                            Starts from <strong className="text-charcoal-900 dark:text-white">
                              {startingPrice > 0 ? `₹${startingPrice}` : 'N/A'}
                            </strong>
                          </span>
                          <Link
                            href={`/salons/${salon.id}`}
                            className="text-xs font-semibold text-rosegold-500 hover:text-rosegold-650 flex items-center gap-0.5"
                          >
                            Explore Profile
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-rosegold-200 dark:border-charcoal-800 rounded-3xl space-y-3">
                <Compass className="w-12 h-12 text-charcoal-300 mx-auto animate-spin" />
                <h3 className="text-lg font-bold text-charcoal-850 dark:text-white font-playfair">No matches found</h3>
                <p className="text-xs text-charcoal-400 max-w-xs mx-auto font-light">
                  No salons match your selected locations, pricing segment, or tags. Try resetting filters.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedLocalities([]);
                      setBudgetFilters([]);
                      setLuxuryOnly(false);
                      setHomeServiceOnly(false);
                      setMinRating(0);
                      setSearchTerm('');
                    }}
                    className="px-5 py-2 rounded-full bg-rosegold-500 hover:bg-rosegold-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
