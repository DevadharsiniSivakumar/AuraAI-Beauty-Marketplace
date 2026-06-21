'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  MapPin, 
  Star, 
  SlidersHorizontal, 
  Compass,
  ChevronRight
} from 'lucide-react';

function ExploreSalonsContent() {
  const { salons } = useApp();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  // Filters state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Top search & title bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-rosegold-200/40 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-955 dark:text-white font-playfair font-playfair">Discover Salons</h1>
            <p className="text-sm text-charcoal-550 dark:text-rosegold-200">Personalized beauty planning matched to your active profile across the platform.</p>
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
                  Luxury Brands Only
                </label>
                <label className="flex items-center text-xs text-charcoal-600 dark:text-rosegold-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={homeServiceOnly}
                    onChange={(e) => setHomeServiceOnly(e.target.checked)}
                    className="rounded-md border-rosegold-300 text-rosegold-500 focus:ring-rosegold-500 mr-2 h-4 w-4 bg-transparent"
                  />
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
                      </div>

                      {/* Info body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-charcoal-955 dark:text-white line-clamp-1">{salon.name}</h3>
                            <div className="flex items-center text-rosegold-550 shrink-0 text-sm">
                              <Star className="w-4 h-4 fill-rosegold-500 mr-1" />
                              <span className="font-bold">{salon.rating}</span>
                              <span className="text-[10px] text-charcoal-450 ml-1">({salon.reviewsCount || salon.reviews?.length || 0})</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-charcoal-400 flex items-center">
                            <MapPin className="w-3.5 h-3.5 text-rosegold-500 mr-1.5 shrink-0" />
                            {salon.location}
                          </p>

                          <p className="text-xs text-charcoal-550 dark:text-rosegold-350">
                            Price Range: <strong className="text-charcoal-900 dark:text-white">{startingPrice > 0 ? `Starts from ₹${startingPrice}` : 'N/A'}</strong>
                          </p>
                        </div>

                        {/* Card footer buttons */}
                        <div className="pt-4 border-t border-rosegold-100 dark:border-charcoal-800/80 flex gap-2">
                          <Link
                            href={`/salons/${salon.id}`}
                            className="flex-1 text-center py-2.5 rounded-xl border border-rosegold-200 dark:border-charcoal-800 text-xs font-semibold text-charcoal-600 dark:text-rosegold-200 hover:bg-rosegold-50 dark:hover:bg-charcoal-955/30 transition-colors cursor-pointer"
                          >
                            View Details
                          </Link>
                          <Link
                            href={`/booking?salon=${salon.id}`}
                            className="flex-1 text-center py-2.5 rounded-xl bg-linear-to-r from-rosegold-500 to-gold-metallic hover:from-rosegold-600 hover:to-gold-dark text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          >
                            Book Salon
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

export default function ExploreSalons() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-rosegold-50 dark:bg-charcoal-950">
        <div className="w-8 h-8 border-4 border-rosegold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ExploreSalonsContent />
    </Suspense>
  );
}
