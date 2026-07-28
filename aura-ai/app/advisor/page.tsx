'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
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
  Info,
  RefreshCw,
  XCircle,
  LayoutDashboard,
  Calendar,
  Compass,
  ArrowLeft,
  LogOut,
  MessageSquare,
  Store
} from 'lucide-react';

export default function StyleAdvisor() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { salons, activeJourney, saveJourney, deleteActiveJourney, userProfile, userMemory, beautyProfile, saveBeautyProfile } = useApp();
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.substring(0, 2).toUpperCase();

  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasResults, setHasResults] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanStep, setScanStep] = useState('');

  // Sync selected photo and results from active beauty profile on load
  useEffect(() => {
    if (beautyProfile) {
      setSelectedPhoto(beautyProfile.imageUrl || null);
      setHasResults(true);
    }
  }, [beautyProfile]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg('');
    
    // Validate format: JPG, JPEG, PNG, WEBP
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedFormats.includes(file.type)) {
      setErrorMsg('Unsupported format. Please upload JPG, JPEG, PNG, or WEBP.');
      return;
    }
    
    // Validate size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File too large. Maximum size is 10 MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedPhoto(reader.result as string);
      triggerRealAnalysis(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerRealAnalysis = async (base64Image: string) => {
    setAnalyzing(true);
    setProgress(0);
    setHasResults(false);
    setErrorMsg('');
    
    const steps = [
      'Scanning facial contours & alignment...',
      'Analyzing hair texture & density...',
      'Measuring skin tone & melanin levels...',
      'Synthesizing clinical beauty profile...',
      'Generating bespoke style insights...'
    ];

    let currentStepIdx = 0;
    setScanStep(steps[currentStepIdx]);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);

    const stepInterval = setInterval(() => {
      if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        setScanStep(steps[currentStepIdx]);
      }
    }, 800);

    try {
      const response = await fetch('/api/analyze-selfie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64Image
        })
      });

      clearInterval(progressInterval);
      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed. Please try again.');
      }

      const results = await response.json();
      
      // Normalize result strings to dropdown expectations in main context
      let normalizedFaceShape = results.faceShape || 'Oval';
      if (normalizedFaceShape.toLowerCase().includes('oval')) normalizedFaceShape = 'Oval';
      else if (normalizedFaceShape.toLowerCase().includes('round')) normalizedFaceShape = 'Round';
      else if (normalizedFaceShape.toLowerCase().includes('square')) normalizedFaceShape = 'Square';
      else if (normalizedFaceShape.toLowerCase().includes('heart')) normalizedFaceShape = 'Heart';
      else normalizedFaceShape = 'Oval';

      let normalizedHairType = results.hairType || '2C Wavy';
      if (normalizedHairType.toLowerCase().includes('wavy')) normalizedHairType = '2C Wavy';
      else if (normalizedHairType.toLowerCase().includes('curly')) normalizedHairType = 'Curly';
      else if (normalizedHairType.toLowerCase().includes('coily')) normalizedHairType = 'Coily';
      else if (normalizedHairType.toLowerCase().includes('straight')) normalizedHairType = 'Straight';
      else normalizedHairType = '2C Wavy';

      let normalizedSkinTone = results.skinTone || 'Warm Beige / Olive';
      if (normalizedSkinTone.toLowerCase().includes('olive') || normalizedSkinTone.toLowerCase().includes('beige') || normalizedSkinTone.toLowerCase().includes('honey')) {
        normalizedSkinTone = 'Warm Beige / Olive';
      } else if (normalizedSkinTone.toLowerCase().includes('fair') || normalizedSkinTone.toLowerCase().includes('pink')) {
        normalizedSkinTone = 'Fair / Cool Pink';
      } else if (normalizedSkinTone.toLowerCase().includes('bronze') || normalizedSkinTone.toLowerCase().includes('deep') || normalizedSkinTone.toLowerCase().includes('umber')) {
        normalizedSkinTone = 'Deep Bronze';
      } else {
        normalizedSkinTone = 'Warm Beige / Olive';
      }

      results.faceShape = normalizedFaceShape;
      results.hairType = normalizedHairType;
      results.skinTone = normalizedSkinTone;
      results.hairLength = results.hairLength || 'Medium';

      // Save using saveBeautyProfile from AppContext
      await saveBeautyProfile(results);
      setProgress(100);
      setHasResults(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during selfie analysis.');
      setSelectedPhoto(null);
      setHasResults(false);
    } finally {
      setAnalyzing(false);
      setScanStep('');
    }
  };

  const handleReset = () => {
    setSelectedPhoto(null);
    setAnalyzing(false);
    setProgress(0);
    setHasResults(false);
    setErrorMsg('');
  };

  // V2 Expanded style recommendations
  const defaultStyleResults = {
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

  const hairstyles = beautyProfile?.recommendedHairstyles?.map((name: string, idx: number) => ({
    name,
    desc: `Bespoke styling suitable for your ${beautyProfile.faceShape.toLowerCase()} face contour and ${beautyProfile.hairType.toLowerCase()} hair.`,
    image: defaultStyleResults.hairstyles[idx % defaultStyleResults.hairstyles.length].image
  })) || defaultStyleResults.hairstyles;

  const makeups = beautyProfile?.recommendedMakeupStyles?.map((name: string, idx: number) => ({
    name,
    desc: `Premium custom cosmetics tailored for your ${beautyProfile.skinTone.toLowerCase()} skin tone with a ${beautyProfile.undertone?.toLowerCase() || 'warm'} undertone.`,
    image: defaultStyleResults.makeups[idx % defaultStyleResults.makeups.length].image
  })) || defaultStyleResults.makeups;

  const services = beautyProfile?.recommendedTreatments?.map((name: string, idx: number) => {
    const isSkincare = name.toLowerCase().includes('facial') || name.toLowerCase().includes('skin') || name.toLowerCase().includes('peel') || name.toLowerCase().includes('glow') || name.toLowerCase().includes('hydra');
    return {
      name,
      category: isSkincare ? 'Skincare' : 'Hair',
      salonId: idx % 2 === 0 ? 'bodycraft-indiranagar' : 'bounce-koramangala',
      serviceId: idx % 2 === 0 ? 'bc-facial-1' : 'bounce-scalp-1',
      desc: `Expertly recommended ${isSkincare ? 'skin conditioning' : 'hair nourishment'} therapy to match your Beauty DNA.`
    };
  }) || defaultStyleResults.services;

  const styleResults = {
    hairstyles,
    makeups,
    services
  };

  return (
    <div className="flex h-screen bg-cream overflow-hidden text-darktext">
      
      {/* Sidebar - Identical in shape/color to Admin/Client sidebars */}
      <aside className="w-64 bg-plum text-warmwhite flex flex-col flex-shrink-0 shadow-xl border-r border-plum-dark/40 z-20">
        <div className="h-20 flex items-center px-6 border-b border-plum-dark/50 gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0c051a] flex items-center justify-center border border-rosegold-300/40">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover scale-[1.7]" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-wide text-white">Aura Hub</span>
        </div>
        
        {/* Navigation Sidebar List */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          <Link 
            href="/dashboard?tab=overview"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <LayoutDashboard className="w-4 h-4 text-peach" />
            Overview
          </Link>

          <Link 
            href="/salons"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <Store className="w-4 h-4 text-peach" />
            Explore Salons
          </Link>

          <Link 
            href="/dashboard?tab=saved"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <Heart className="w-4 h-4 text-peach" />
            Saved Salons
          </Link>

          <Link 
            href="/dashboard?tab=bookings"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <Calendar className="w-4 h-4 text-peach" />
            My Bookings
          </Link>

          <Link 
            href="/dashboard?tab=journey"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <Compass className="w-4 h-4 text-peach" />
            Beauty Journey
          </Link>

          <button 
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer bg-cream/15 text-white shadow-xs border-l-4 border-peach text-left"
          >
            <Camera className="w-4 h-4 text-peach animate-pulse" />
            Selfie Scanner
          </button>

          <Link 
            href="/compare"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <TrendingUp className="w-4 h-4 text-peach" />
            Compare Salons
          </Link>
        </nav>

        {/* Sidebar Footer Operations */}
        <div className="p-4 border-t border-plum-dark/50 space-y-1.5 flex-shrink-0">
          <Link 
            href="/"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-warmwhite/75 hover:text-white transition-colors rounded-lg hover:bg-cream/5 text-left"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose hover:text-rose-dark transition-colors rounded-lg hover:bg-rose/10 text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out Account
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-border flex items-center justify-between px-8 flex-shrink-0 shadow-xs z-10">
          <h2 className="text-xl font-serif font-bold text-darktext capitalize">
            Aura AI Style Advisor
          </h2>
          
          <div className="flex items-center gap-3.5">
            <div className="text-right">
              <p className="text-xs font-bold text-darktext">{userName}</p>
              <p className="text-[10px] text-mutedtext">{user?.email || 'Authenticated client'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-plum text-warmwhite flex items-center justify-center font-bold text-sm shadow-md border-2 border-peach">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Content Workspace */}
        <main className="flex-grow overflow-y-auto p-8 bg-cream/40 space-y-8">
          
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-xs max-w-4xl mx-auto space-y-2 animate-in fade-in">
            <h3 className="text-lg font-serif font-bold text-darktext flex items-center gap-2">
              <Camera className="w-5 h-5 text-plum" />
              Aura AI Selfie Scanner
            </h3>
            <p className="text-xs text-mutedtext">
              Construct a detailed facial, hair, and skin undertone profile using selfie scans to get bespoke recommendations.
            </p>
          </div>

          <section className="max-w-4xl mx-auto animate-in fade-in">
              <div className="rounded-md border border-gray-200 dark:border-gray-300 bg-white dark:bg-gray-800 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
                
                {/* Selfie Upload Area */}
                <div className="p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-300 flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-serif">Beauty Profile Scanner</h3>
                    <p className="text-xs text-gray-900 dark:text-gray-300">
                      Upload your portrait to analyze and construct your personalized beauty profile.
                    </p>
                  </div>

                  {selectedPhoto ? (
                    <div className="relative aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-300 bg-gray-800 dark:bg-gray-800 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={selectedPhoto} 
                        alt="Selfie for analysis" 
                        className="w-full h-full object-cover" 
                      />
                      
                      {/* Scanner overlay */}
                      {analyzing && (
                        <div className="absolute inset-0 bg-black/45 flex flex-col justify-end p-4 text-white">
                          <div className=""></div>
                          <div className="space-y-2 z-10">
                            <div className="flex items-center space-x-2 text-xs font-mono text-gray-600">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>{scanStep || 'Scanning skin layers...'}</span>
                            </div>
                            <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                              <div className="bg-gray-100 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {!analyzing && hasResults && (
                        <div className="absolute inset-0 bg-emerald-950/20  flex items-center justify-center">
                          <div className="bg-white/95 dark:bg-gray-800 p-3 rounded-full text-emerald-600 shadow-sm flex items-center space-x-2 text-xs font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            <span>Scan Completed</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center p-6 text-center space-y-4 transition-colors ${
                        dragActive 
                          ? 'border-gray-200 bg-gray-100 dark:bg-gray-800' 
                          : 'border-gray-200 dark:border-gray-300 hover:border-gray-200 dark:hover:border-gray-200 bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Drag and drop your selfie</p>
                        <p className="text-xs text-gray-900 dark:text-gray-300">or click below to browse your files</p>
                      </div>
                      <label className="px-5 py-2.5 rounded-xl bg-plum hover:bg-plum-dark text-warmwhite text-xs font-semibold cursor-pointer transition-colors inline-block">
                        Select Photo
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-gray-900 dark:text-gray-400">
                        Supports JPG, JPEG, PNG, WEBP up to 10 MB
                      </p>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-500 flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>

                {/* AI analysis result feedback */}
                <div className="p-8 bg-gray-100 dark:bg-gray-800 flex flex-col justify-between">
                  
                  {hasResults ? (
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest font-mono">Aura Summary</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1 font-serif">Beauty Profile</h3>
                        <p className="text-xs text-gray-900 dark:text-gray-300 mt-1">Your personalized style parameters.</p>
                      </div>

                      {/* Beauty Profile Summary card */}
                      <div className="space-y-4 border border-gray-200 dark:border-gray-300 bg-white dark:bg-gray-800 p-5 rounded-md shadow-sm text-xs">
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-900 dark:text-gray-300">Face Contour</span>
                          <span className="font-bold text-gray-900 dark:text-white font-mono">
                            {beautyProfile?.faceShape || 'Oval'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-900 dark:text-gray-300">Hair Texture</span>
                          <span className="font-bold text-gray-900 dark:text-white font-mono">
                            {beautyProfile?.hairType || '2C Wavy'} {beautyProfile?.hairDensity ? `(${beautyProfile.hairDensity})` : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-900 dark:text-gray-300">Skin Undertone</span>
                          <span className="font-bold text-gray-900 dark:text-white font-mono">
                            {beautyProfile?.skinTone || 'Warm Olive'} {beautyProfile?.undertone ? `(${beautyProfile.undertone})` : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-gray-900 dark:text-gray-300">Preferred Care</span>
                          <span className="font-bold text-gray-600 dark:text-gray-300 font-mono">
                            {beautyProfile?.hairType?.toLowerCase()?.includes('straight') ? 'Sleek & Hydrate' : 'Texture Cuts & Skincare'}
                          </span>
                        </div>
                      </div>

                      {/* Summary explanation */}
                      {beautyProfile?.beautySummary && (
                        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs leading-relaxed text-gray-900 dark:text-gray-300 italic">
                            &ldquo;{beautyProfile.beautySummary}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Reset action */}
                      <button
                        onClick={handleReset}
                        className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Scan Another Selfie
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 text-gray-900">
                      <Sparkles className="w-10 h-10 text-gray-600/80 dark:text-gray-300" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-300">Advisor Ready</p>
                        <p className="text-xs leading-relaxed max-w-[240px] mx-auto font-light dark:text-gray-400">
                          Upload a portrait photo to analyze face mapping coordinates and load recommendations.
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-gray-600" />
                  Recommended Hairstyles
                </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {styleResults.hairstyles.map((style: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-300 bg-white dark:bg-gray-800 space-y-3 hover:border-gray-200 transition-colors shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={style.image} alt={style.name} className="w-full h-28 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{style.name}</h4>
                        <p className="text-[11px] text-gray-900 dark:text-gray-300 leading-normal font-light mt-1">{style.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Makeup Styles */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gray-600" />
                  Recommended Makeup Styles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {styleResults.makeups.map((style: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-300 bg-white dark:bg-gray-800 space-y-3 hover:border-gray-200 transition-colors shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={style.image} alt={style.name} className="w-full h-28 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{style.name}</h4>
                        <p className="text-[11px] text-gray-900 dark:text-gray-300 leading-normal font-light mt-1">{style.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* SECTION 3: Recommended Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Scissors className="w-5 h-5 text-gray-600" />
                Recommended Treatments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {styleResults.services.map((service: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-300 bg-white dark:bg-gray-800 flex flex-col justify-between h-40 hover:border-gray-200 transition-colors">
                    <div>
                      <span className="text-[9px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">{service.category}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{service.name}</h4>
                      <p className="text-[11px] text-gray-900 dark:text-gray-300 leading-relaxed font-light mt-1">{service.desc}</p>
                    </div>
                    <Link
                      href={`/booking?salon=${service.salonId}&service=${service.serviceId}`}
                      className="w-full py-2 text-center rounded-lg bg-plum hover:bg-plum-dark text-[10px] font-bold text-warmwhite flex items-center justify-center gap-1 transition-colors"
                    >
                      Book Appointment
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: Recommended Salons */}
            <div className="p-6 rounded-md border border-gray-200 dark:border-gray-300 bg-white dark:bg-gray-800 space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-serif">Recommended Salons</h3>
                <p className="text-xs text-gray-900 dark:text-gray-300">
                  Salons matching your active style profile and preferences.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {salons.slice(0, 2).map((salon: any) => (
                  <div 
                    key={salon.id} 
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-300 bg-white dark:bg-gray-800 flex flex-col justify-between gap-4 hover:border-gray-200 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-plum/10 border border-plum/20 text-plum">
                          {salon.matchScore}% Match
                        </span>
                        <div className="flex text-gray-600 text-xs items-center font-bold">
                          <Star className="w-3.5 h-3.5 fill-rosegold-500 mr-0.5" />
                          {salon.rating}
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{salon.name}</h4>
                      <p className="text-xs text-gray-900 dark:text-gray-300 flex items-center">
                        <MapPin className="w-3 h-3 text-gray-600 dark:text-gray-400 mr-1" />
                        {salon.location}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 pt-1">
                        {salon.badges.slice(0, 2).map((tag: any) => (
                          <span key={tag} className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-300">
                      <Link
                        href={`/salons/${salon.id}`}
                        className="w-full py-2 text-center rounded-lg bg-plum hover:bg-plum-dark text-warmwhite text-xs font-semibold flex items-center justify-center gap-1"
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
      </div>

    </div>
  );
}
