'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Search, 
  CheckCircle, 
  XCircle, 
  Star,
  Activity,
  Compass,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface ComparisonData {
  feature1Comparison: {
    salonName: string;
    rating: number;
    priceRange: string;
    reviewScore: string;
    popularServices: string[];
    aiRecommendationBadge: string;
  }[];
  feature2ReviewIntelligence: {
    salonName: string;
    overallSentiment: string;
    topStrengths: string[];
    commonComplaints: string[];
    mostMentionedServices: string[];
  }[];
  recommendation: {
    recommendedSalonName: string;
    reasonText: string;
  };
}

export default function CompareSalons() {
  const { salons, userMemory, userProfile } = useApp();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ComparisonData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestedQueries = [
    "Compare Bodycraft and Bounce",
    "Which is better for a Hydra Facial?",
    "Luxury salon vs budget salon",
    "Is Play Salon worth the price?"
  ];

  const handleCompare = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setIsLoading(true);
    setError(null);
    setData(null);

    // Provide memory context if available
    const memoryContext = userMemory 
      ? `User prefers ${userMemory.preferredCategories?.join(', ')} salons, budget around ${userMemory.averageBudget}, and likes ${userMemory.likedServices?.join(', ')}.`
      : `User is ${userProfile?.name} with no specific stored preferences.`;

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          salons,
          memoryContext
        })
      });

      if (!res.ok) {
        throw new Error('Failed to generate comparison. Please try again.');
      }

      const result = await res.json();
      if (result.error) throw new Error(result.error);
      
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-rosegold-50 dark:bg-charcoal-950 transition-colors">
      <Navbar />

      <main className="flex-grow flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-10">
        
        {/* Header & Search Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-xs mb-2">
            <Sparkles className="w-4 h-4 text-rosegold-500" />
            <span className="text-[10px] uppercase tracking-widest font-bold bg-linear-to-r from-rosegold-500 to-gold-metallic bg-clip-text text-transparent">
              AI Decision Engine
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-charcoal-950 dark:text-white font-playfair leading-tight">
            Compare & Discover
          </h1>
          <p className="text-sm text-charcoal-550 dark:text-rosegold-200 max-w-xl mx-auto">
            Not sure which salon to book? Ask AuraAI to analyze millions of reviews and compare options based on your personal beauty profile.
          </p>

          <div className="relative w-full max-w-2xl mx-auto pt-4">
            <div className="relative flex items-center bg-white dark:bg-charcoal-900 border border-rosegold-300 dark:border-charcoal-700 rounded-2xl shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-rosegold-500 transition-all p-1.5">
              <input
                type="text"
                placeholder="e.g., Compare Bodycraft and Bounce for Bridal Makeup..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCompare(query)}
                className="w-full bg-transparent px-4 py-3 text-charcoal-900 dark:text-white placeholder-charcoal-400 focus:outline-hidden text-sm"
              />
              <button
                onClick={() => handleCompare(query)}
                disabled={isLoading || !query.trim()}
                className="flex items-center gap-2 bg-linear-to-r from-rosegold-500 to-gold-metallic text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Analyze</span>
              </button>
            </div>
          </div>

          {/* Suggested Queries */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {suggestedQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleCompare(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-rosegold-200 dark:border-charcoal-800 bg-white/60 dark:bg-charcoal-900/60 text-charcoal-600 dark:text-rosegold-200 hover:border-rosegold-400 dark:hover:border-rosegold-600 transition-colors shadow-2xs font-light cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-fade-in">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-rosegold-100 dark:border-charcoal-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-rosegold-500 border-t-transparent rounded-full animate-spin"></div>
              <Sparkles className="w-6 h-6 text-rosegold-600 dark:text-gold-medium animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-charcoal-900 dark:text-white">Analyzing Reviews & Metrics...</h3>
              <p className="text-xs text-charcoal-500 dark:text-rosegold-300">AuraAI is aggregating sentiment data to find your best match.</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <XCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-bold text-charcoal-900 dark:text-white">Analysis Failed</h3>
            <p className="text-sm text-charcoal-500 dark:text-rosegold-300">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {data && !isLoading && (
          <section className="space-y-12 animate-fade-in pb-16">
            
            {/* AI Recommendation Banner */}
            <div className="bg-linear-to-r from-rosegold-500 to-gold-metallic rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
                  <Star className="w-8 h-8 fill-white text-white" />
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-white/80 mb-1">AuraAI Recommendation</h3>
                  <h2 className="text-2xl font-bold font-playfair mb-2">{data.recommendation.recommendedSalonName}</h2>
                  <p className="text-sm text-white/90 leading-relaxed font-medium">
                    {data.recommendation.reasonText}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Feature 1: Visual Comparison Cards */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-charcoal-950 dark:text-white flex items-center gap-2 border-b border-rosegold-200 dark:border-charcoal-800 pb-3">
                  <Activity className="w-5 h-5 text-rosegold-500" />
                  Salon Comparison
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {data.feature1Comparison.map((salon, idx) => {
                    const salonObj = salons.find(s => s.name === salon.salonName);
                    return (
                      <div key={idx} className="bg-white dark:bg-charcoal-900 rounded-2xl border border-rosegold-200 dark:border-charcoal-800 shadow-xs hover:shadow-md transition-shadow overflow-hidden group">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-charcoal-950 dark:text-white font-playfair">{salon.salonName}</h4>
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rosegold-50 dark:bg-charcoal-800 border border-rosegold-100 dark:border-charcoal-700 mt-2">
                                <Sparkles className="w-3.5 h-3.5 text-rosegold-500" />
                                <span className="text-[10px] font-bold text-charcoal-800 dark:text-rosegold-200 uppercase tracking-wider">{salon.aiRecommendationBadge}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end text-rosegold-550 font-bold text-lg">
                                <Star className="w-4 h-4 fill-rosegold-500 mr-1" />
                                {salon.rating}
                              </div>
                              <span className="text-xs text-charcoal-450 block">{salon.priceRange}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3 pt-4 border-t border-rosegold-100 dark:border-charcoal-800">
                            <div>
                              <span className="text-xs text-charcoal-500 dark:text-rosegold-300 block mb-1">Review Consensus</span>
                              <p className="text-sm font-medium text-charcoal-800 dark:text-white">{salon.reviewScore}</p>
                            </div>
                            <div>
                              <span className="text-xs text-charcoal-500 dark:text-rosegold-300 block mb-1.5">Top Popular Services</span>
                              <div className="flex flex-wrap gap-1.5">
                                {salon.popularServices.map((srv, i) => (
                                  <span key={i} className="text-[10px] px-2 py-1 rounded bg-charcoal-50 dark:bg-charcoal-950 border border-charcoal-100 dark:border-charcoal-800 text-charcoal-600 dark:text-rosegold-200">
                                    {srv}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        {salonObj && (
                          <div className="px-6 py-3 bg-rosegold-50/50 dark:bg-charcoal-950 border-t border-rosegold-100 dark:border-charcoal-800">
                            <Link 
                              href={`/booking?salon=${salonObj.id}`}
                              className="text-xs font-bold text-rosegold-600 dark:text-gold-medium hover:text-rosegold-700 dark:hover:text-gold-light flex items-center gap-1 w-fit"
                            >
                              Book Appointment <Compass className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feature 2: Review Intelligence */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-charcoal-950 dark:text-white flex items-center gap-2 border-b border-rosegold-200 dark:border-charcoal-800 pb-3">
                  <MessageSquare className="w-5 h-5 text-rosegold-500" />
                  Review Intelligence
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {data.feature2ReviewIntelligence.map((intel, idx) => (
                    <div key={idx} className="bg-white dark:bg-charcoal-900 rounded-2xl border border-rosegold-200 dark:border-charcoal-800 p-6 shadow-xs">
                      <div className="flex items-center justify-between mb-5">
                        <h4 className="text-base font-bold text-charcoal-900 dark:text-white">{intel.salonName}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          intel.overallSentiment.toLowerCase() === 'positive' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400'
                            : intel.overallSentiment.toLowerCase() === 'negative'
                              ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'
                              : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400'
                        }`}>
                          {intel.overallSentiment} Sentiment
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-charcoal-700 dark:text-rosegold-200 flex items-center gap-1.5">
                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" /> Strengths
                          </h5>
                          <ul className="space-y-1.5">
                            {intel.topStrengths.map((str, i) => (
                              <li key={i} className="text-xs text-charcoal-600 dark:text-charcoal-300 flex items-start gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-charcoal-700 dark:text-rosegold-200 flex items-center gap-1.5">
                            <ThumbsDown className="w-3.5 h-3.5 text-red-400" /> Complaints
                          </h5>
                          <ul className="space-y-1.5">
                            {intel.commonComplaints.length > 0 ? (
                              intel.commonComplaints.map((comp, i) => (
                                <li key={i} className="text-xs text-charcoal-600 dark:text-charcoal-300 flex items-start gap-1.5">
                                  <XCircle className="w-3.5 h-3.5 text-red-300 shrink-0 mt-0.5" />
                                  <span>{comp}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-xs text-charcoal-400 italic">No consistent complaints detected.</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>
        )}

      </main>
      
      <Footer />
    </div>
  );
}
