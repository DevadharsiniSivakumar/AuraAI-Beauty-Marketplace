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
  const { salons, activeJourney, saveJourney, deleteActiveJourney, userProfile, userMemory } = useApp();
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasResults, setHasResults] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Journey Planner state variables
  const [activeTab, setActiveTab] = useState<'scanner' | 'planner'>('scanner');
  const [goalInput, setGoalInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [visibleSalonsForStep, setVisibleSalonsForStep] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'planner') {
        setActiveTab('planner');
      }
    }
  }, []);

  const quickGoals = [
    { label: 'Wedding in 45 days', text: 'My wedding is in 45 days. I need a complete glow-up plan for skin and hair.' },
    { label: 'Party next week', text: 'I have a major party next week and need to look my absolute best.' },
    { label: 'Dry/damaged hair recovery', text: 'My hair is severely dry and damaged. I need a recovery journey.' },
    { label: 'Acne & skin glow', text: 'I want to clear up my skin congestion and get a healthy radiant glow.' }
  ];

  const getMatchingSalonsForService = (serviceName: string) => {
    const query = serviceName.toLowerCase();
    return salons.map(salon => {
      const matchingServices = salon.services.filter(s => 
        s.name.toLowerCase().includes(query) || 
        query.includes(s.name.toLowerCase()) ||
        s.category.toLowerCase().includes(query) ||
        query.includes(s.category.toLowerCase())
      );
      if (matchingServices.length === 0) return null;
      return {
        ...salon,
        matchedService: matchingServices[0]
      };
    }).filter((s): s is any => s !== null);
  };

  const handleSaveJourney = async () => {
    if (!generatedPlan) return;
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (generatedPlan.durationDays || 30));

      await saveJourney({
        goal: goalInput,
        journeyType: generatedPlan.journeyType,
        durationDays: generatedPlan.durationDays || 30,
        steps: generatedPlan.steps.map((step: any) => ({
          ...step,
          status: 'Pending'
        })),
        targetDate: targetDate.toISOString().split('T')[0]
      });
      setSaveSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateJourney = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goalInput.trim()) return;

    setGenerating(true);
    setGeneratedPlan(null);
    setSaveSuccess(false);
    setVisibleSalonsForStep({});

    try {
      const res = await fetch('/api/journey/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userGoal: goalInput,
          userProfile,
          userMemory
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate journey');
      }

      const data = await res.json();
      setGeneratedPlan(data);
    } catch (err) {
      console.error('Fetch failed, generating local fallback:', err);
      // Client-side quick fallback construction
      const clientFallback = (goal: string) => {
        const goalLower = goal.toLowerCase();
        let type: any = 'Maintenance';
        let days = 30;
        let steps = [];

        if (goalLower.includes('wed') || goalLower.includes('marri') || goalLower.includes('brid')) {
          type = 'Bridal';
          days = 45;
          steps = [
            { stepNumber: 1, title: 'Consultation & Hydra Facial', description: 'Begin hydration prep and skin health evaluation.', timeline: 'Day 45 (6 Weeks Out)', recommendedService: 'Advanced Hydra Facial' },
            { stepNumber: 2, title: 'Hair Spa', description: 'Rehydrate wavy hair strands and protect fiber roots.', timeline: 'Day 30 (4 Weeks Out)', recommendedService: 'Hair Spa' },
            { stepNumber: 3, title: 'Manicure & Pedicure', description: 'Soften hands and feet for event-day neatness.', timeline: 'Day 15 (2 Weeks Out)', recommendedService: 'Pedicure' },
            { stepNumber: 4, title: 'Rose Gold Glow Facial', description: 'Lock in skin brightness without harsh treatments.', timeline: 'Day 3 (3 Days Out)', recommendedService: 'Rose Gold Shimmer Facial' },
          ];
        } else if (goalLower.includes('part') || goalLower.includes('event')) {
          type = 'Event Prep';
          days = 7;
          steps = [
            { stepNumber: 1, title: 'Hydra Facial Reset', description: 'Exfoliate dead surface cells for clear skin.', timeline: 'Day 7 (1 Week Out)', recommendedService: 'Advanced Hydra Facial' },
            { stepNumber: 2, title: 'Hair Spa Moisture Boost', description: 'Add gloss and texture styling prep.', timeline: 'Day 3 (3 Days Out)', recommendedService: 'Hair Spa' },
            { stepNumber: 3, title: 'Nails Prep', description: 'Clean, shape and paint nails.', timeline: 'Day 1 (1 Day Out)', recommendedService: 'Pedicure' },
          ];
        } else {
          steps = [
            { stepNumber: 1, title: 'Skincare Reset', description: 'Exfoliate and deep cleanse layers.', timeline: 'Week 1', recommendedService: 'Advanced Hydra Facial' },
            { stepNumber: 2, title: 'Relaxation & Massage', description: 'Relieve stress and improve lymphatic flow.', timeline: 'Week 2', recommendedService: 'Deep Tissue Massage' },
            { stepNumber: 3, title: 'Nails & Grooming', description: 'Routine clean up and moisturizing.', timeline: 'Week 4', recommendedService: 'Pedicure' },
          ];
        }

        return { journeyType: type, durationDays: days, steps };
      };
      setGeneratedPlan(clientFallback(goalInput));
    } finally {
      setGenerating(false);
    }
  };

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
        <section className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-rosegold-300 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-2xs text-xs font-semibold text-rosegold-550">
            <Sparkles className="w-3.5 h-3.5 text-rosegold-500 animate-pulse" />
            <span>AuraAI Style & Planning Hub</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-charcoal-950 dark:text-white">
            AI Style Advisor & Beauty Planner
          </h1>
          <p className="text-sm sm:text-base text-charcoal-550 dark:text-rosegold-200">
            Get personalized consultations, scan your Beauty DNA, or build automated step-by-step beauty goal journeys.
          </p>

          {/* Tab Selector */}
          <div className="flex justify-center max-w-md mx-auto bg-rosegold-100/50 dark:bg-charcoal-900/60 p-1.5 rounded-full border border-rosegold-200/50 dark:border-charcoal-800 shadow-inner mt-6">
            <button 
              onClick={() => setActiveTab('scanner')}
              className={`flex-grow py-2 px-6 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'scanner' 
                  ? 'bg-linear-to-r from-rosegold-600 to-rosegold-800 text-white shadow-md font-bold' 
                  : 'text-charcoal-600 dark:text-rosegold-200 hover:text-rosegold-700'
              }`}
            >
              Style Scanner
            </button>
            <button 
              onClick={() => setActiveTab('planner')}
              className={`flex-grow py-2 px-6 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'planner' 
                  ? 'bg-linear-to-r from-rosegold-600 to-rosegold-800 text-white shadow-md font-bold' 
                  : 'text-charcoal-600 dark:text-rosegold-200 hover:text-rosegold-700'
              }`}
            >
              AI Journey Planner
            </button>
          </div>
        </section>

        {/* Tab content condition */}
        {activeTab === 'scanner' ? (
          <>
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
                    className="p-4 rounded-xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 flex flex-col justify-between gap-4 hover:border-rosegold-350 transition-colors"
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
      </>
    ) : (
          <section className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Active Journey Indicator */}
            {activeJourney && (
              <div className="rounded-2xl border border-rosegold-200/50 bg-rosegold-50/20 dark:bg-charcoal-900/60 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Active Journey: {activeJourney.journeyType} Plan ({activeJourney.durationDays} Days)
                  </h4>
                  <p className="text-xs text-charcoal-500 dark:text-rosegold-200">
                    Goal: &ldquo;{activeJourney.goal}&rdquo; | Progress: {activeJourney.progressPercent}%
                  </p>
                </div>
                <button
                  onClick={deleteActiveJourney}
                  className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Reset Journey
                </button>
              </div>
            )}

            {/* Planner Input card */}
            <div className="rounded-3xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 shadow-lg p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-charcoal-950 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rosegold-500" />
                  Define Your Beauty Goal
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-550 dark:text-rosegold-300 mt-1">
                  Tell Aura what you want to prepare for or recover. We will design a customized, multi-week timeline.
                </p>
              </div>

              {/* Suggestions Chips */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-widest text-charcoal-400">Quick suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {quickGoals.map((g, idx) => (
                    <button
                      key={idx}
                      onClick={() => setGoalInput(g.text)}
                      className="px-3 py-1.5 rounded-lg border border-rosegold-200 dark:border-charcoal-800 bg-rosegold-50/20 dark:bg-charcoal-950/20 text-xs text-charcoal-800 dark:text-rosegold-200 hover:border-rosegold-400 dark:hover:border-rosegold-600 transition-colors cursor-pointer"
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={(e) => handleGenerateJourney(e)} className="space-y-4">
                <textarea
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g. My wedding is in 45 days and I want perfect skin and silky smooth hair..."
                  className="w-full min-h-[100px] p-4 rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-charcoal-50/20 dark:bg-charcoal-950/40 text-sm focus:outline-none focus:ring-2 focus:ring-rosegold-400 text-charcoal-950 dark:text-white placeholder-charcoal-400 resize-y"
                  required
                />
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={generating || !goalInput.trim()}
                    className="px-6 py-3 rounded-xl bg-linear-to-r from-rosegold-600 to-rosegold-800 hover:from-rosegold-500 hover:to-rosegold-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating Journey...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Journey Plan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Generated Plan details */}
            {generatedPlan && (
              <div className="space-y-8 animate-fade-in">
                {/* Header overview card */}
                <div className="rounded-3xl border border-rosegold-200 dark:border-charcoal-850 bg-linear-to-r from-rosegold-100/35 via-white to-white dark:from-charcoal-900 dark:to-charcoal-950/60 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-md">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic text-white tracking-widest uppercase">
                      {generatedPlan.journeyType} Journey
                    </span>
                    <h3 className="text-2xl font-bold text-charcoal-950 dark:text-white">
                      Your Beauty Roadmap ({generatedPlan.durationDays} Days)
                    </h3>
                    <p className="text-xs text-charcoal-550 dark:text-rosegold-300">
                      Goal: &ldquo;{goalInput}&rdquo;
                    </p>
                  </div>

                  {saveSuccess ? (
                    <div className="px-5 py-2.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-600 rounded-xl font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Saved to Profile
                    </div>
                  ) : (
                    <button
                      onClick={handleSaveJourney}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      Save Journey to Profile
                    </button>
                  )}
                </div>

                {/* Steps Timeline visualization */}
                <div className="relative pl-6 sm:pl-8 border-l border-rosegold-200 dark:border-charcoal-800 space-y-10">
                  {generatedPlan.steps.map((step: any) => {
                    const matchedSalons = getMatchingSalonsForService(step.recommendedService);
                    const isSalonsVisible = visibleSalonsForStep[step.stepNumber];

                    return (
                      <div key={step.stepNumber} className="relative group animate-fade-in">
                        {/* Bullet Circle */}
                        <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full border-2 border-rosegold-400 bg-white dark:bg-charcoal-950 flex items-center justify-center font-bold text-[10px] text-rosegold-500">
                          {step.stepNumber}
                        </div>

                        {/* Step content card */}
                        <div className="rounded-2xl border border-rosegold-200/50 dark:border-charcoal-900 bg-white dark:bg-charcoal-950 p-6 hover:border-rosegold-350 transition-colors shadow-2xs space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <span className="text-[10px] font-bold text-rosegold-500 uppercase tracking-widest bg-rosegold-100/30 dark:bg-charcoal-800 px-2 py-0.5 rounded-md">
                              {step.timeline}
                            </span>
                            <h4 className="text-base font-bold text-charcoal-900 dark:text-white">
                              {step.title}
                            </h4>
                          </div>

                          <p className="text-xs sm:text-sm text-charcoal-600 dark:text-rosegold-200 leading-relaxed font-light">
                            {step.description}
                          </p>

                          <div className="pt-2 border-t border-rosegold-100 dark:border-charcoal-800/85 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="text-xs">
                              <span className="text-charcoal-400">Recommended service:</span>{' '}
                              <strong className="text-charcoal-800 dark:text-white">{step.recommendedService}</strong>
                            </div>

                            <button
                              onClick={() => setVisibleSalonsForStep(prev => ({
                                ...prev,
                                [step.stepNumber]: !prev[step.stepNumber]
                              }))}
                              className="px-3.5 py-1.5 border border-rosegold-350 dark:border-charcoal-850 hover:bg-rosegold-50/50 dark:hover:bg-charcoal-800 text-[10px] font-bold text-rosegold-550 dark:text-rosegold-300 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                            >
                              {isSalonsVisible ? 'Hide Salons' : 'Find Salons'}
                              <ChevronRight className={`w-3 h-3 transition-transform ${isSalonsVisible ? 'rotate-90' : ''}`} />
                            </button>
                          </div>

                          {/* On-Demand Salon recommendations block */}
                          {isSalonsVisible && (
                            <div className="pt-4 border-t border-dashed border-rosegold-200 dark:border-charcoal-800 animate-fade-in space-y-3">
                              <div className="flex justify-between items-center">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-charcoal-400">
                                  Nearby Salons offering this treatment
                                </p>
                              </div>

                              {matchedSalons.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {matchedSalons.slice(0, 2).map((salon) => (
                                    <div 
                                      key={salon.id} 
                                      className="p-4 rounded-xl border border-rosegold-200/40 dark:border-charcoal-850 bg-charcoal-50/20 dark:bg-charcoal-900/40 flex flex-col justify-between gap-3 hover:border-rosegold-300 transition-all shadow-xs"
                                    >
                                      <div>
                                        <div className="flex justify-between items-center text-[10px]">
                                          <span className="font-semibold text-rosegold-550 dark:text-rosegold-350">
                                            {salon.matchedService.name} (₹{salon.matchedService.price})
                                          </span>
                                          <div className="flex text-rosegold-500 items-center font-bold">
                                            <Star className="w-3.5 h-3.5 fill-rosegold-500 mr-0.5" />
                                            {salon.rating}
                                          </div>
                                        </div>
                                        <h5 className="text-xs font-bold text-charcoal-900 dark:text-white mt-1">
                                          {salon.name}
                                        </h5>
                                        <p className="text-[10px] text-charcoal-400 flex items-center mt-0.5">
                                          <MapPin className="w-2.5 h-2.5 text-rosegold-500 mr-0.5" />
                                          {salon.locality}
                                        </p>
                                      </div>

                                      <Link
                                        href={`/booking?salon=${salon.id}&service=${salon.matchedService.id}`}
                                        className="w-full py-1.5 text-center rounded-lg bg-rosegold-500 hover:bg-rosegold-600 text-[10px] font-bold text-white transition-colors"
                                      >
                                        Book Step Appointment
                                      </Link>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-charcoal-400 py-2 italic">
                                  No salons in our index currently match &ldquo;{step.recommendedService}&rdquo;. Try browsing our booking page!
                                </p>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
