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
  SlidersHorizontal
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discover Salons</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Find the perfect beauty services for you.</p>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search salon or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-md focus:outline-hidden focus:border-gray-500 text-gray-900 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filter Panel */}
          <aside className="lg:col-span-1 p-6 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-md space-y-6 h-fit">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
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
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Neighborhood Checkboxes */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Neighborhood</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {localitiesList.map((locality) => (
                  <label key={locality} className="flex items-center text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLocalities.includes(locality)}
                      onChange={() => handleLocalityToggle(locality)}
                      className="rounded-sm border-gray-300 dark:border-gray-600 mr-2 h-4 w-4"
                    />
                    {locality}
                  </label>
                ))}
              </div>
            </div>

            {/* Service Type Switch */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Preferences</h4>
              <div className="space-y-2">
                <label className="flex items-center text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={luxuryOnly}
                    onChange={(e) => setLuxuryOnly(e.target.checked)}
                    className="rounded-sm border-gray-300 dark:border-gray-600 mr-2 h-4 w-4"
                  />
                  Luxury Brands Only
                </label>
                <label className="flex items-center text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={homeServiceOnly}
                    onChange={(e) => setHomeServiceOnly(e.target.checked)}
                    className="rounded-sm border-gray-300 dark:border-gray-600 mr-2 h-4 w-4"
                  />
                  Offers Home Service
                </label>
              </div>
            </div>

            {/* Price Segment Checkbox */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Pricing</h4>
              <div className="space-y-2">
                <label className="flex items-center text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={budgetFilters.includes('low')}
                    onChange={() => handleBudgetToggle('low')}
                    className="rounded-sm border-gray-300 dark:border-gray-600 mr-2 h-4 w-4"
                  />
                  Budget-Friendly (&lt; ₹2000)
                </label>
                <label className="flex items-center text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={budgetFilters.includes('mid')}
                    onChange={() => handleBudgetToggle('mid')}
                    className="rounded-sm border-gray-300 dark:border-gray-600 mr-2 h-4 w-4"
                  />
                  Premium (₹2000 - ₹5000)
                </label>
                <label className="flex items-center text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={budgetFilters.includes('high')}
                    onChange={() => handleBudgetToggle('high')}
                    className="rounded-sm border-gray-300 dark:border-gray-600 mr-2 h-4 w-4"
                  />
                  Luxury (&gt; ₹5000)
                </label>
              </div>
            </div>

            {/* Rating selector slider */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Minimum Rating</h4>
              <div className="flex gap-2">
                {[0, 4.4, 4.6, 4.8].map((ratingVal) => (
                  <button
                    key={ratingVal}
                    onClick={() => setMinRating(ratingVal)}
                    className={`flex-1 text-center py-1 border rounded-md text-xs cursor-pointer ${
                      minRating === ratingVal 
                        ? 'bg-gray-900 border-gray-900 text-white dark:bg-white dark:text-gray-900 dark:border-white font-medium' 
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {ratingVal === 0 ? 'All' : `${ratingVal}+`}
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
                      className="border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black overflow-hidden flex flex-col justify-between"
                    >
                      {/* Image container */}
                      <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={salon.image} 
                          alt={salon.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      {/* Info body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{salon.name}</h3>
                            <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                              <span>{salon.rating}</span>
                              <span className="text-gray-500 ml-1 text-xs font-normal">({salon.reviewsCount || salon.reviews?.length || 0})</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-1 shrink-0" />
                            {salon.location}
                          </p>

                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Starts from: <strong className="text-gray-900 dark:text-white">{startingPrice > 0 ? `₹${startingPrice}` : 'N/A'}</strong>
                          </p>
                        </div>

                        {/* Card footer buttons */}
                        <div className="pt-4 flex gap-2">
                          <Link
                            href={`/salons/${salon.id}`}
                            className="flex-1 text-center py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            View Details
                          </Link>
                          <Link
                            href={`/booking?salon=${salon.id}`}
                            className="flex-1 text-center py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
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
              <div className="text-center py-20 border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No matches found</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  No salons match your selected filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedLocalities([]);
                    setBudgetFilters([]);
                    setLuxuryOnly(false);
                    setHomeServiceOnly(false);
                    setMinRating(0);
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm font-medium"
                >
                  Reset Filters
                </button>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    }>
      <ExploreSalonsContent />
    </Suspense>
  );
}
