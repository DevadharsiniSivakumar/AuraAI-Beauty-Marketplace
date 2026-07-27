'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ClientConsoleLayout from '../components/ClientConsoleLayout';
import { useApp } from '../context/AppContext';

export default function SalonsPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialLocation = searchParams.get('location') || '';
  const initialCategory = searchParams.get('category') || '';

  const { salons, addFavorite, removeFavorite, isFavorite } = useApp();
  const [filteredSalons, setFilteredSalons] = useState(salons);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [category, setCategory] = useState(initialCategory);
  const [rating, setRating] = useState('');
  
  // Fake loading state to show skeletons
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      let filtered = salons;
      
      if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(lowerQ) || 
          s.services.some(svc => svc.name.toLowerCase().includes(lowerQ))
        );
      }
      
      if (location) {
        filtered = filtered.filter(s => s.location.toLowerCase().includes(location.toLowerCase()));
      }
      
      if (category) {
        filtered = filtered.filter(s => 
          s.services.some(svc => svc.category.toLowerCase() === category.toLowerCase())
        );
      }
      
      if (rating) {
        filtered = filtered.filter(s => s.rating >= parseFloat(rating));
      }
      
      setFilteredSalons(filtered);
      setIsLoading(false);
    }, 400); // 400ms fake loading for visual feedback

    return () => clearTimeout(timer);
  }, [searchQuery, location, category, rating, salons]);

  return (
    <ClientConsoleLayout activeSidebarItem="explore" headerTitle="Explore Salons">
        {/* Header & Search */}
        <div className="bg-warmwhite border-b border-border pt-12 pb-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-sm text-mutedtext mb-4">
              <Link href="/" className="hover:text-plum">Home</Link> <span className="mx-2">/</span> <span className="text-darktext font-medium">Explore Salons</span>
            </div>
            
            <h1 className="font-serif text-3xl md:text-4xl text-darktext mb-8">Explore salons</h1>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search salons, services..." 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-lg text-darktext focus:outline-none focus:border-plum shadow-sm"
                />
                <span className="absolute left-3 top-3.5 text-mutedtext">🔍</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Filter Toolbar */}
        <div className="bg-white border-b border-border sticky top-[72px] z-40 px-4 sm:px-6 lg:px-8 py-3 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-darktext mr-2 hidden md:inline-block">Filters:</span>
            
            <select 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-cream border border-border text-darktext text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-plum"
            >
              <option value="">Any Area</option>
              <option value="Indiranagar">Indiranagar</option>
              <option value="Koramangala">Koramangala</option>
              <option value="Jayanagar">Jayanagar</option>
              <option value="Whitefield">Whitefield</option>
            </select>
            
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-cream border border-border text-darktext text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-plum"
            >
              <option value="">Any Category</option>
              <option value="hair">Hair</option>
              <option value="skin">Skin</option>
              <option value="bridal">Bridal</option>
              <option value="spa">Spa</option>
            </select>

            <select 
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="bg-cream border border-border text-darktext text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-plum"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5 & up</option>
              <option value="4.7">4.7 & up</option>
              <option value="4.9">4.9 & up</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-6 flex justify-between items-end">
            <span className="text-sm text-mutedtext">
              {isLoading ? 'Searching...' : `Showing ${filteredSalons.length} results`}
            </span>
          </div>

          {isLoading ? (
            // Tasteful Skeletons
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-white border border-border rounded-lg overflow-hidden">
                  <div className="aspect-[4/3] bg-border-dark opacity-20"></div>
                  <div className="p-5 space-y-4">
                    <div className="h-5 bg-border-dark opacity-20 rounded w-2/3"></div>
                    <div className="h-4 bg-border-dark opacity-20 rounded w-1/3"></div>
                    <div className="pt-3 border-t border-border flex justify-between">
                      <div className="h-4 bg-border-dark opacity-20 rounded w-1/2"></div>
                      <div className="h-4 bg-border-dark opacity-20 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSalons.length > 0 ? (
            // Salon Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSalons.map((salon) => (
                <div key={salon.id} className="group bg-white rounded-lg border border-border overflow-hidden hover:border-plum transition-colors duration-200 shadow-sm hover:shadow-md">
                  <Link href={`/salons/${salon.id}`} className="block">
                    <div className="aspect-[4/3] bg-border relative overflow-hidden">
                      <div className="absolute inset-0 bg-sage opacity-20 group-hover:scale-105 transition-transform duration-500"></div>
                      
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-darktext">
                        {salon.services[0]?.category || 'Beauty'}
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-5 flex flex-col gap-2 relative">
                    <button 
                      onClick={() => isFavorite(salon.id) ? removeFavorite(salon.id) : addFavorite(salon.id)}
                      className="absolute top-4 right-4 text-2xl leading-none focus:outline-none hover:scale-110 transition-transform"
                      aria-label="Toggle Favorite"
                    >
                      <span className={isFavorite(salon.id) ? "text-rose" : "text-border-dark"}>
                        {isFavorite(salon.id) ? '♥' : '♡'}
                      </span>
                    </button>

                    <Link href={`/salons/${salon.id}`} className="block">
                      <div className="pr-8">
                        <h3 className="font-semibold text-lg text-darktext group-hover:text-plum transition-colors">{salon.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-mutedtext">{salon.location}</span>
                          <span className="text-mutedtext text-xs">•</span>
                          <div className="flex items-center gap-1">
                            <span className="text-gold text-xs">★</span>
                            <span className="text-sm font-medium text-darktext">{salon.rating}</span>
                            <span className="text-mutedtext text-xs">({salon.reviewsCount})</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                        <p className="text-sm text-darktext line-clamp-1">{salon.services[0]?.name}</p>
                        <span className="text-sm font-medium">₹{salon.services[0]?.price}</span>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="bg-white border border-border rounded-lg p-12 text-center max-w-2xl mx-auto mt-10">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="text-xl font-medium text-darktext mb-2">No salons found</h3>
              <p className="text-mutedtext">We couldn't find any salons matching your current filters. Try adjusting your search criteria.</p>
              <button 
                onClick={() => { setSearchQuery(''); setLocation(''); setCategory(''); setRating(''); }}
                className="mt-6 text-plum font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
    </ClientConsoleLayout>
  );
}
