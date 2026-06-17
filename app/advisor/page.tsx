'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Upload, 
  User, 
  Camera, 
  RotateCcw, 
  CheckCircle, 
  Scissors, 
  MapPin, 
  ChevronRight,
  TrendingUp,
  Heart,
  Star,
  Info
} from 'lucide-react';

export default function StyleAdvisor() {
  const { salons } = useApp();
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasResults, setHasResults] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const mockSelfies = [
    { name: 'Model A', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
    { name: 'Model B', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop' },
    { name: 'Model C', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop' }
  ];

  // Scan simulation progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (analyzing) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setAnalyzing(false);
            setHasResults(true);
            return 100;
          }
          return prev + 10;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  const startAnalysis = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setAnalyzing(true);
    setProgress(0);
    setHasResults(false);
  };

  const handleReset = () => {
    setSelectedPhoto(null);
    setAnalyzing(false);
    setProgress(0);
    setHasResults(false);
  };

  // V2 Expanded style recommendations
  const styleResults = {
    hairstyles: [
      { name: 'Layer Cut', desc: 'Adds movement and lightness to your waves, highlighting your jawline.', image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=300' },
      { name: 'Soft Waves', desc: 'Perfectly texturized styling that matches your natural 2C density.', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=300' },
      { name: 'Curtain Bangs', desc: 'Faces contouring frame that narrows the oval top and shifts focus to your cheekbones.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300' },
      { name: 'Wolf Cut', desc: 'Edgy shaggy layers that add crown volume for a modern aesthetic.', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300' }
    ],
    makeups: [
      { name: 'Soft Glam', desc: 'Warm neutral tones on eyes with satin lip finish for modern styling.', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300' },
      { name: 'Bridal Glow', desc: 'Premium HD foundations, gold undertones, and secure sarees draping.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300' },
      { name: 'Natural Makeup', desc: 'Bespoke lightweight coverage with soft rose blushes.', image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=300' },
      { name: 'Dewy Finish', desc: 'Hydration glass skin glow suitable for warm honey undertones.', image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=300' }
    ],
    services: [
      { name: 'Advanced Hydra Facial', category: 'Skincare', salonId: 'bodycraft-indiranagar', serviceId: 'bc-facial-1', desc: 'Deep hydration for low-sebum skin barriers.' },
      { name: 'Tea Tree Scalp Detox & Hair Spa', category: 'Hair', salonId: 'bounce-koramangala', serviceId: 'bounce-scalp-1', desc: 'Cleanse and restore wavy hair follicles.' },
      { name: 'Premium Keratin Smoothening', category: 'Hair', salonId: 'toni-guy-jayanagar', serviceId: 'tg-hair-2', desc: 'Remove frizz from 2C wave density.' },
      { name: 'Elite Bridal Makeup', category: 'Bridal', salonId: 'play-salon-vittal-mallya', serviceId: 'play-bridal-1', desc: 'HD bridal styling by celebrity MUAs.' }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Banner */}
        <section className="space-y-2 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-rosegold-300 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-2xs text-xs font-semibold text-rosegold-550">
            <Sparkles className="w-3.5 h-3.5 text-rosegold-500 animate-spin" />
            <span>AI Computer Vision Scanner</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-charcoal-950 dark:text-white">
            AI Style Advisor
          </h1>
          <p className="text-sm sm:text-base text-charcoal-550 dark:text-rosegold-200">
            Scan your profile to map facial metrics, lock your Beauty DNA, and receive precise styling plans.
          </p>
        </section>

        {/* Uploader and Scanner Panel */}
        <section className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
            
            {/* Selfie Upload / Selector Area */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-rosegold-200/50 dark:border-charcoal-800 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-lg font-bold text-charcoal-950 dark:text-white mb-2">Selfie Upload Sandbox</h3>
                <p className="text-xs text-charcoal-450 dark:text-rosegold-350">
                  Select a mock profile photo to preview the AI beauty scanning engine in action.
                </p>
              </div>

              {selectedPhoto ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-rosegold-200 dark:border-charcoal-800 bg-charcoal-50 dark:bg-charcoal-950 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={selectedPhoto} 
                    alt="Selfie for analysis" 
                    className="w-full h-full object-cover" 
                  />
                  
                  {/* Scanner overlay */}
                  {analyzing && (
                    <div className="absolute inset-0 bg-black/35 flex flex-col justify-end p-4 text-white">
                      <div className="animate-scan"></div>
                      <div className="space-y-1">
                        <p className="text-xs font-mono">Scanning skin layers...</p>
                        <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                          <div className="bg-rosegold-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!analyzing && hasResults && (
                    <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-xs flex items-center justify-center">
                      <div className="bg-white/95 dark:bg-charcoal-900/95 p-3 rounded-full text-emerald-600 shadow-lg flex items-center space-x-2 text-xs font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Scan Completed</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  onClick={() => startAnalysis(mockSelfies[0].url)}
                  className="cursor-pointer aspect-square rounded-2xl border-2 border-dashed border-rosegold-200 dark:border-charcoal-800 hover:border-rosegold-400 dark:hover:border-rosegold-700 bg-rosegold-50/10 dark:bg-charcoal-950/20 flex flex-col items-center justify-center p-6 text-center space-y-3 group"
                >
                  <div className="w-12 h-12 rounded-full bg-rosegold-500/10 text-rosegold-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-charcoal-800 dark:text-white">Click mock models below</p>
                    <p className="text-xs text-charcoal-400">to initiate simulated skin layer detection</p>
                  </div>
                </div>
              )}

              {/* Mock photo list */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase font-bold tracking-widest text-charcoal-400">Choose simulated model</p>
                <div className="flex gap-4">
                  {mockSelfies.map((ms, idx) => (
                    <button
                      key={idx}
                      onClick={() => startAnalysis(ms.url)}
                      disabled={analyzing}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedPhoto === ms.url ? 'border-rosegold-500 ring-2 ring-rosegold-100 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ms.url} alt={ms.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* AI analysis result feedback */}
            <div className="p-8 bg-rosegold-50/20 dark:bg-charcoal-950/20 flex flex-col justify-between">
              
              {hasResults ? (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-rosegold-500 uppercase tracking-widest">AuraAI Diagnostic</span>
                    <h3 className="text-xl font-bold text-charcoal-950 dark:text-white mt-1">Beauty DNA Profile</h3>
                    <p className="text-xs text-charcoal-450 mt-1">Your permanent AI beauty identity token.</p>
                  </div>

                  {/* Beauty DNA Profile (Section 5) */}
                  <div className="space-y-3 border border-rosegold-300 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 p-4 rounded-2xl shadow-xs">
                    <div className="flex justify-between items-center text-xs py-1 border-b border-rosegold-100 dark:border-charcoal-800">
                      <span className="text-charcoal-400">Face Shape:</span>
                      <span className="font-bold text-charcoal-900 dark:text-white">Oval Contour</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1 border-b border-rosegold-100 dark:border-charcoal-800">
                      <span className="text-charcoal-400">Hair Type:</span>
                      <span className="font-bold text-charcoal-900 dark:text-white">2C Wavy (High Density)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1 border-b border-rosegold-100 dark:border-charcoal-800">
                      <span className="text-charcoal-400">Skin Tone:</span>
                      <span className="font-bold text-charcoal-900 dark:text-white">Warm Beige / Olive</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1 border-b border-rosegold-100 dark:border-charcoal-800">
                      <span className="text-charcoal-400">Preferences:</span>
                      <span className="font-bold text-charcoal-900 dark:text-white text-right">Luxury / Indiranagar</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1">
                      <span className="text-charcoal-400">Category:</span>
                      <span className="font-bold text-rosegold-500">Skincare & Texture Cuts</span>
                    </div>
                  </div>

                  {/* Reset action */}
                  <button
                    onClick={handleReset}
                    className="w-full py-2.5 rounded-xl border border-rosegold-300 dark:border-charcoal-800 text-xs font-semibold text-charcoal-800 dark:text-rosegold-100 hover:bg-rosegold-100 dark:hover:bg-charcoal-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Scan Another Selfie
                  </button>
                </div>
              ) : analyzing ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-rosegold-200 border-t-rosegold-500 animate-spin"></div>
                    <Sparkles className="absolute w-6 h-6 text-rosegold-500 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-charcoal-800 dark:text-white">Topography Scan in Progress...</p>
                    <p className="text-xs text-charcoal-400">{progress}% complete</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 text-charcoal-400">
                  <Sparkles className="w-10 h-10 text-rosegold-400/80" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-charcoal-850 dark:text-rosegold-100">Advisor Ready</p>
                    <p className="text-xs leading-relaxed max-w-[240px] mx-auto font-light">
                      Select a test portrait to analyze face mapping coordinates and load recommendations.
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>
        </section>

        {/* V2 Results Panels - Hairstyles, Makeup, Services, Salons */}
        {hasResults && (
          <section className="space-y-12 max-w-5xl mx-auto pt-6">
            
            {/* Section 1 & Section 2: Hairstyles & Makeup recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* SECTION 1: Hairstyles */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-charcoal-950 dark:text-white flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-rosegold-500" />
                  Recommended Hairstyles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {styleResults.hairstyles.map((style, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-rosegold-200/50 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-3 hover:border-rosegold-300 transition-colors shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={style.image} alt={style.name} className="w-full h-28 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-charcoal-900 dark:text-white">{style.name}</h4>
                        <p className="text-[11px] text-charcoal-550 dark:text-rosegold-300 leading-normal font-light mt-1">{style.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Makeup Styles */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-charcoal-950 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rosegold-500" />
                  Recommended Makeup Styles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {styleResults.makeups.map((style, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-rosegold-200/50 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-3 hover:border-rosegold-300 transition-colors shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={style.image} alt={style.name} className="w-full h-28 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-charcoal-900 dark:text-white">{style.name}</h4>
                        <p className="text-[11px] text-charcoal-550 dark:text-rosegold-300 leading-normal font-light mt-1">{style.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* SECTION 3: Recommended Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-charcoal-950 dark:text-white flex items-center gap-2">
                <Scissors className="w-5 h-5 text-rosegold-500" />
                Recommended Treatments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {styleResults.services.map((service, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-rosegold-200/50 dark:border-charcoal-900 bg-white dark:bg-charcoal-900 flex flex-col justify-between h-40 hover:border-rosegold-300 transition-colors">
                    <div>
                      <span className="text-[9px] font-bold text-rosegold-500 uppercase tracking-widest">{service.category}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-charcoal-900 dark:text-white line-clamp-1">{service.name}</h4>
                      <p className="text-[11px] text-charcoal-500 dark:text-rosegold-300 leading-relaxed font-light mt-1">{service.desc}</p>
                    </div>
                    <Link
                      href={`/booking?salon=${service.salonId}&service=${service.serviceId}`}
                      className="w-full py-2 text-center rounded-lg bg-rosegold-500 hover:bg-rosegold-650 text-[10px] font-bold text-white flex items-center justify-center gap-1 transition-colors"
                    >
                      Book Appointment
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: Recommended Salons */}
            <div className="p-6 rounded-2xl border border-rosegold-350 dark:border-charcoal-800 bg-linear-to-r from-rosegold-100/35 via-white to-white dark:from-charcoal-900 dark:to-charcoal-950/60 space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-charcoal-950 dark:text-white">Recommended Salons</h3>
                <p className="text-xs text-charcoal-500 dark:text-rosegold-250">
                  AuraAI vision algorithms recommend the following Bangalore salons based on your Beauty DNA profile.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {salons.slice(0, 2).map((salon) => (
                  <div 
                    key={salon.id} 
                    className="p-4 rounded-xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-955 flex flex-col justify-between gap-4 hover:border-rosegold-350 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic text-white">
                          {salon.matchScore}% Match
                        </span>
                        <div className="flex text-rosegold-500 text-xs items-center font-bold">
                          <Star className="w-3.5 h-3.5 fill-rosegold-500 mr-0.5" />
                          {salon.rating}
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-bold text-charcoal-900 dark:text-white">{salon.name}</h4>
                      <p className="text-xs text-charcoal-400 flex items-center">
                        <MapPin className="w-3 h-3 text-rosegold-500 mr-1" />
                        {salon.location}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 pt-1">
                        {salon.badges.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-rosegold-100/40 dark:bg-charcoal-800 text-charcoal-600 dark:text-rosegold-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-rosegold-100 dark:border-charcoal-800">
                      <Link
                        href={`/salons/${salon.id}`}
                        className="w-full py-2 text-center rounded-lg bg-rosegold-500 hover:bg-rosegold-600 text-white text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        Explore Salon Profile
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
