'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';

export default function ComparePage() {
  const { salons } = useApp();
  
  // By default, just compare the first 3 salons for demo purposes if none selected via state
  const [selectedIds, setSelectedIds] = useState<string[]>([
    salons[0]?.id,
    salons[1]?.id,
    salons[2]?.id
  ].filter(Boolean) as string[]);

  const compareSalons = selectedIds.map(id => salons.find(s => s.id === id)).filter(Boolean) as any[];

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-darktext mb-2">Compare Salons</h1>
            <p className="text-mutedtext">Side-by-side analysis of your selected options.</p>
          </div>
          <Link href="/salons" className="text-plum text-sm font-medium hover:underline">
            + Add another salon
          </Link>
        </div>

        {compareSalons.length > 0 ? (
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-6 border-b border-r border-border bg-warmwhite min-w-[150px] align-bottom">
                    <span className="text-sm font-medium text-mutedtext uppercase tracking-wider">Features</span>
                  </th>
                  {compareSalons.map(salon => (
                    <th key={salon.id} className="p-6 border-b border-border bg-warmwhite min-w-[250px] relative group">
                      <button 
                        onClick={() => setSelectedIds(prev => prev.filter(id => id !== salon.id))}
                        className="absolute top-4 right-4 text-mutedtext hover:text-rose opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-sage/20 border border-border rounded overflow-hidden"></div>
                        <div>
                          <h3 className="font-medium text-lg text-darktext">{salon.name}</h3>
                          <Link href={`/salons/${salon.id}`} className="text-xs text-plum hover:underline">View Profile</Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                
                {/* Rating */}
                <tr className="hover:bg-cream/50 transition-colors">
                  <td className="p-6 border-b border-r border-border font-medium text-darktext">Rating</td>
                  {compareSalons.map(salon => {
                    const isHighest = Math.max(...compareSalons.map(s => s.rating)) === salon.rating;
                    return (
                      <td key={salon.id} className={`p-6 border-b border-border ${isHighest ? 'bg-gold/5' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-gold">★</span>
                          <span className={`font-medium ${isHighest ? 'text-darktext' : 'text-mutedtext'}`}>{salon.rating}</span>
                          <span className="text-xs text-mutedtext">({salon.reviewsCount})</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Location */}
                <tr className="hover:bg-cream/50 transition-colors">
                  <td className="p-6 border-b border-r border-border font-medium text-darktext">Location</td>
                  {compareSalons.map(salon => (
                    <td key={salon.id} className="p-6 border-b border-border text-mutedtext">
                      {salon.location}
                    </td>
                  ))}
                </tr>

                {/* Price Range */}
                <tr className="hover:bg-cream/50 transition-colors">
                  <td className="p-6 border-b border-r border-border font-medium text-darktext">Avg. Price</td>
                  {compareSalons.map(salon => {
                    const avg = Math.round(salon.services.reduce((acc: number, cur: any) => acc + cur.price, 0) / salon.services.length);
                    const isLowest = Math.min(...compareSalons.map(s => Math.round(s.services.reduce((a: number, c: any) => a + c.price, 0) / s.services.length))) === avg;
                    return (
                      <td key={salon.id} className={`p-6 border-b border-border ${isLowest ? 'bg-sage/5' : ''}`}>
                        <span className={`font-medium ${isLowest ? 'text-sage' : 'text-darktext'}`}>₹{avg}</span>
                        <span className="text-xs text-mutedtext block mt-1">based on {salon.services.length} services</span>
                      </td>
                    );
                  })}
                </tr>

                {/* Top Services */}
                <tr className="hover:bg-cream/50 transition-colors">
                  <td className="p-6 border-b border-r border-border font-medium text-darktext">Top Services</td>
                  {compareSalons.map(salon => (
                    <td key={salon.id} className="p-6 border-b border-border align-top">
                      <ul className="space-y-2">
                        {salon.services.slice(0, 3).map((svc: any) => (
                          <li key={svc.id} className="text-mutedtext">
                            <span className="text-darktext">•</span> {svc.name}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Review Themes (Mocked) */}
                <tr className="hover:bg-cream/50 transition-colors">
                  <td className="p-6 border-b border-r border-border font-medium text-darktext">Review Themes</td>
                  {compareSalons.map((salon, i) => {
                    const themes = [
                      ['Highly professional', 'Clean environment', 'Punctual'],
                      ['Great ambiance', 'Premium products', 'Expensive'],
                      ['Friendly staff', 'Value for money', 'Busy on weekends']
                    ][i % 3];
                    return (
                      <td key={salon.id} className="p-6 border-b border-border align-top">
                        <div className="flex flex-wrap gap-2">
                          {themes.map(theme => (
                            <span key={theme} className="px-2 py-1 bg-cream border border-border rounded text-xs text-mutedtext">
                              {theme}
                            </span>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-6 border-r border-border"></td>
                  {compareSalons.map(salon => (
                    <td key={salon.id} className="p-6">
                      <Link 
                        href={`/booking?salon=${salon.id}&service=${salon.services[0]?.id}`}
                        className="block w-full py-3 bg-plum text-warmwhite text-center rounded-md font-medium hover:bg-plum-dark transition-colors shadow-sm"
                      >
                        Book Now
                      </Link>
                    </td>
                  ))}
                </tr>
                
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl p-12 text-center shadow-sm">
            <span className="text-4xl mb-4 block">⚖️</span>
            <h3 className="text-xl font-medium text-darktext mb-2">Nothing to compare</h3>
            <p className="text-mutedtext mb-6">Select salons from the explore page to see them side by side.</p>
            <Link href="/salons" className="px-6 py-3 bg-plum text-warmwhite rounded-md font-medium hover:bg-plum-dark transition-colors shadow-sm inline-block">
              Explore Salons
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
