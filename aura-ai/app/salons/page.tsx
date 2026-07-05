'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';

function ExploreSalonsContent() {
  const { salons } = useApp();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || searchParams.get('category') || searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');

  const areas = ['Indiranagar', 'Koramangala', 'Vittal Mallya Rd', 'Jayanagar', 'HSR Layout', 'Lavelle Road'];
  const servicesList = ['Hair', 'Skincare', 'Bridal', 'Nails', 'Massages'];

  const filteredSalons = useMemo(() => {
    return salons.filter(salon => {
      if (searchTerm && !salon.name.toLowerCase().includes(searchTerm.toLowerCase()) && !salon.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        const hasMatchingService = salon.services?.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.category.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!hasMatchingService) return false;
      }
      
      if (selectedArea && salon.locality !== selectedArea) return false;
      
      if (selectedService) {
        const hasService = salon.services?.some(s => s.category === selectedService);
        if (!hasService) return false;
      }

      if (maxBudget) {
        const startingPrice = salon.services?.length ? Math.min(...salon.services.map(s => s.price)) : 0;
        if (startingPrice > parseInt(maxBudget)) return false;
      }

      if (minRating && salon.rating < parseFloat(minRating)) return false;

      return true;
    });
  }, [salons, searchTerm, selectedArea, selectedService, maxBudget, minRating]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAF8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#2D2926] mb-2">Explore salons</h1>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Search salon or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-base px-4 py-3 border border-[#E5DED8] bg-[#FFFFFF] rounded-md focus:outline-none focus:border-[#9D5965] text-[#2D2926]"
          />

          <div className="flex flex-wrap gap-4 items-center">
            <select 
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-2 border border-[#E5DED8] rounded-md bg-[#FFFFFF] text-sm text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
            >
              <option value="">All Areas</option>
              {areas.map(area => <option key={area} value={area}>{area}</option>)}
            </select>

            <select 
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 border border-[#E5DED8] rounded-md bg-[#FFFFFF] text-sm text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
            >
              <option value="">All Services</option>
              {servicesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="px-3 py-2 border border-[#E5DED8] rounded-md bg-[#FFFFFF] text-sm text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
            >
              <option value="">Any Budget</option>
              <option value="1500">Under ₹1500</option>
              <option value="3000">Under ₹3000</option>
              <option value="5000">Under ₹5000</option>
            </select>

            <select 
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="px-3 py-2 border border-[#E5DED8] rounded-md bg-[#FFFFFF] text-sm text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
            >
              <option value="">Any Rating</option>
              <option value="4.0">4.0 &amp; above</option>
              <option value="4.5">4.5 &amp; above</option>
              <option value="4.8">4.8 &amp; above</option>
            </select>
            
            {(searchTerm || selectedArea || selectedService || maxBudget || minRating) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedArea('');
                  setSelectedService('');
                  setMaxBudget('');
                  setMinRating('');
                }}
                className="text-sm text-[#716A65] hover:text-[#9D5965] underline decoration-[#E5DED8] underline-offset-4"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div>
          {filteredSalons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSalons.map((salon) => {
                const startingPrice = salon.services?.length ? Math.min(...salon.services.map(s => s.price)) : 0;
                return (
                  <div key={salon.id} className="border border-[#E5DED8] rounded-md overflow-hidden bg-[#FCFAF8] flex flex-col">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={salon.image} alt={salon.name} className="w-full h-48 object-cover border-b border-[#E5DED8]" />
                    <div className="p-4 flex flex-col flex-1 gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-[#2D2926] text-lg">{salon.name}</h3>
                          <p className="text-sm text-[#716A65]">{salon.locality}</p>
                        </div>
                        <div className="text-sm font-medium text-[#2D2926]">★ {salon.rating}</div>
                      </div>
                      <p className="text-sm text-[#716A65] mt-1">
                        {salon.services?.slice(0, 3).map(s => s.category).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}
                      </p>
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#E5DED8]">
                        <span className="text-sm text-[#716A65]">Starting from ₹{startingPrice}</span>
                        <Link href={`/salons/${salon.id}`} className="text-sm font-medium text-[#FFFFFF] bg-[#2D2926] px-4 py-2 rounded-md hover:bg-[#1a1715] transition-colors">
                          View salon
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-[#E5DED8] rounded-md bg-[#FFFFFF]">
              <h3 className="text-lg font-bold text-[#2D2926] mb-2">No results found</h3>
              <p className="text-sm text-[#716A65]">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ExploreSalons() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFAF8]"></div>}>
      <ExploreSalonsContent />
    </Suspense>
  );
}
