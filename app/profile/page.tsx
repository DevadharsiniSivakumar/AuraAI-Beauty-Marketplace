'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Sparkles, 
  MapPin, 
  Heart, 
  CheckCircle, 
  Star,
  ChevronRight,
  Calendar,
  Clock,
  MessageSquare,
  XCircle,
  Plus,
  Camera,
  Upload,
  RefreshCw
} from 'lucide-react';

export default function ProfilePage() {
  const { 
    userProfile, 
    updateProfile, 
    salons, 
    bookings, 
    reviews, 
    cancelBooking, 
    addReview,
    userMemory,
    beautyProfile,
    saveBeautyProfile
  } = useApp();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'personal' | 'preferences' | 'beauty-profile' | 'bookings' | 'reviews'>('personal');

  // Personal Info Form State
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [location, setLocation] = useState(userProfile.location);

  // Beauty Preferences State
  const [faceShape, setFaceShape] = useState(userProfile.faceShape);
  const [hairType, setHairType] = useState(userProfile.hairType);
  const [skinTone, setSkinTone] = useState(userProfile.skinTone);
  const [budget, setBudget] = useState(userProfile.preferredBudget);

  // Success indicators
  const [isSaved, setIsSaved] = useState(false);

  // Selfie upload & analysis state
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelfiePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeProfile = async () => {
    if (!selfiePreview) return;

    setIsAnalyzing(true);
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

    const stepInterval = setInterval(() => {
      if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        setScanStep(steps[currentStepIdx]);
      }
    }, 700);

    try {
      const response = await fetch('/api/analyze-selfie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: selfiePreview
        })
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error('Analysis failed.');
      }

      const results = await response.json();
      
      // Normalize values to match dropdown entries perfectly
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

      await saveBeautyProfile(results);
      
      // Sync form inputs with newly loaded profile
      setFaceShape(normalizedFaceShape);
      setHairType(normalizedHairType);
      setSkinTone(normalizedSkinTone);
      
    } catch (err) {
      const error = err as Error;
      clearInterval(stepInterval);
      console.error(error);
      setErrorMsg(error.message || 'An error occurred during selfie analysis.');
    } finally {
      setIsAnalyzing(false);
      setScanStep('');
    }
  };

  // Write Review State
  const [reviewSalonId, setReviewSalonId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      phone,
      location
    });
    triggerSavedIndicator();
  };

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      faceShape,
      hairType,
      skinTone,
      preferredBudget: budget
    });
    triggerSavedIndicator();
  };

  const triggerSavedIndicator = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewSalonId || !reviewComment) return;
    await addReview(reviewSalonId, reviewRating, reviewComment, []);
    setReviewComment('');
    setReviewSalonId('');
    setReviewRating(5);
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
    }, 3000);
  };

  // Map favorite salons list
  const favoriteSalonsObj = salons.filter(s => userProfile.favoriteSalons.includes(s.id));

  // Sort bookings newest first
  const sortedBookings = [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter reviews authored by this user
  interface ProfileReview {
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    salonName: string;
    salonId: string;
  }
  const userReviews = (reviews as unknown as ProfileReview[]).filter(r => r.author === userProfile.name);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Tab widget */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-855 bg-white dark:bg-charcoal-900 shadow-xs space-y-6">
            
            {/* Header section with save indicator */}
            <div className="flex justify-between items-center pb-2 border-b border-rosegold-100 dark:border-charcoal-800">
              <h2 className="text-xl font-bold text-charcoal-950 dark:text-white flex items-center gap-2 font-playfair">
                <User className="w-5 h-5 text-rosegold-550" />
                My Account
              </h2>
              {isSaved && (
                <span className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold flex items-center gap-1 animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  Preferences Saved!
                </span>
              )}
            </div>

            {/* Custom Luxury Tabs Switcher */}
            <div className="flex border-b border-rosegold-200/60 dark:border-charcoal-800 pb-px overflow-x-auto gap-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`py-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'personal'
                    ? 'border-rosegold-500 text-rosegold-600 dark:text-rosegold-400'
                    : 'border-transparent text-charcoal-400 hover:text-charcoal-650 dark:hover:text-white'
                }`}
              >
                Personal Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preferences')}
                className={`py-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'preferences'
                    ? 'border-rosegold-500 text-rosegold-600 dark:text-rosegold-400'
                    : 'border-transparent text-charcoal-400 hover:text-charcoal-650 dark:hover:text-white'
                }`}
              >
                Beauty Preferences
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('beauty-profile')}
                className={`py-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'beauty-profile'
                    ? 'border-rosegold-500 text-rosegold-600 dark:text-rosegold-400'
                    : 'border-transparent text-charcoal-400 hover:text-charcoal-650 dark:hover:text-white'
                }`}
              >
                Beauty Profile
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className={`py-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'bookings'
                    ? 'border-rosegold-500 text-rosegold-600 dark:text-rosegold-400'
                    : 'border-transparent text-charcoal-400 hover:text-charcoal-650 dark:hover:text-white'
                }`}
              >
                Bookings ({bookings.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`py-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'border-rosegold-500 text-rosegold-600 dark:text-rosegold-400'
                    : 'border-transparent text-charcoal-400 hover:text-charcoal-650 dark:hover:text-white'
                }`}
              >
                Reviews ({userReviews.length})
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="pt-2">

              {/* Tab 1: Personal Info */}
              {activeTab === 'personal' && (
                <form onSubmit={handlePersonalSubmit} className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Primary Neighborhood</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-linear-to-r from-rosegold-500 to-gold-metallic text-white font-semibold text-xs shadow-xs hover:scale-[1.02] hover:shadow-md transition-all cursor-pointer"
                    >
                      Save Personal Details
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: Preferences */}
              {activeTab === 'preferences' && (
                <form onSubmit={handlePreferencesSubmit} className="space-y-6 animate-fade-in">
                  
                  {/* Active Diagnostics Visual Summary */}
                  <div className="p-4 rounded-xl border border-rosegold-350 dark:border-charcoal-800 bg-linear-to-b from-rosegold-100/10 to-transparent space-y-4">
                    <h3 className="font-bold text-charcoal-950 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-rosegold-500" />
                      Active Diagnostics Profile
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="flex justify-between p-3 bg-white dark:bg-charcoal-950/40 rounded-xl border border-rosegold-100/60 dark:border-charcoal-800/80">
                        <span className="text-charcoal-400">Skin Melanin</span>
                        <span className="font-semibold text-charcoal-900 dark:text-white">{skinTone}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white dark:bg-charcoal-950/40 rounded-xl border border-rosegold-100/60 dark:border-charcoal-800/80">
                        <span className="text-charcoal-400">Hair Thickness</span>
                        <span className="font-semibold text-charcoal-900 dark:text-white">{hairType}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white dark:bg-charcoal-950/40 rounded-xl border border-rosegold-100/60 dark:border-charcoal-800/80">
                        <span className="text-charcoal-400">Face Contour</span>
                        <span className="font-semibold text-charcoal-900 dark:text-white">{faceShape}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Face Shape</label>
                      <select
                        value={faceShape}
                        onChange={(e) => setFaceShape(e.target.value)}
                        className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
                      >
                        <option value="Oval" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Oval Contour</option>
                        <option value="Round" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Round Contour</option>
                        <option value="Square" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Square Contour</option>
                        <option value="Heart" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Heart Contour</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Hair Structure</label>
                      <select
                        value={hairType}
                        onChange={(e) => setHairType(e.target.value)}
                        className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
                      >
                        <option value="2C Wavy" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">2C Wavy Waves</option>
                        <option value="Straight" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">1A Coarse Straight</option>
                        <option value="Curly" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">3B Springy Curls</option>
                        <option value="Coily" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">4C Dense Coils</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Skin Tone Melanin</label>
                      <select
                        value={skinTone}
                        onChange={(e) => setSkinTone(e.target.value)}
                        className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
                      >
                        <option value="Warm Beige / Olive" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Warm Honey / Olive</option>
                        <option value="Fair / Cool Pink" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Fair / Cool Pink</option>
                        <option value="Deep Bronze" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">Deep Umber / Bronze</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Preferred Budget Range</label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
                    >
                      <option value="₹" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">₹ - Budget Saver (Under ₹2000)</option>
                      <option value="₹₹ - ₹₹₹" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">₹₹ - ₹₹₹ - Premium Select (₹2000 - ₹5000)</option>
                      <option value="₹₹₹ - ₹₹₹₹" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">₹₹₹ - ₹₹₹₹ - Luxury Premium (₹5000+)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-linear-to-r from-rosegold-500 to-gold-metallic text-white font-semibold text-xs shadow-xs hover:scale-[1.02] hover:shadow-md transition-all cursor-pointer"
                    >
                      Save Beauty Preferences
                    </button>
                  </div>
                </form>
              )}

              {/* Tab: Beauty Profile */}
              {activeTab === 'beauty-profile' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* If profile doesn't exist AND we are not analyzing/previewing */}
                  {!beautyProfile && !selfiePreview && (
                    <div className="flex flex-col items-center justify-center p-10 border border-dashed border-rosegold-300 dark:border-charcoal-800 rounded-2xl bg-rosegold-50/5 dark:bg-charcoal-950/5 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-rosegold-100/40 dark:bg-charcoal-850/60 flex items-center justify-center text-rosegold-600 dark:text-rosegold-400">
                        <Camera className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-charcoal-900 dark:text-white font-playfair">Upload Your Selfie</h4>
                        <p className="text-xs text-charcoal-400 max-w-sm">
                          Let Aura analyze your face shape, hair type, and skin tone to build your personalized luxury beauty profile.
                        </p>
                      </div>
                      <div>
                        <label className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-linear-to-r from-rosegold-500 to-gold-metallic text-white font-semibold text-xs shadow-xs hover:scale-102 hover:shadow-md transition-all cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Select Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSelfieChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* If previewing / analyzing */}
                  {!beautyProfile && selfiePreview && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="relative aspect-square w-full max-w-xs mx-auto rounded-2xl overflow-hidden border border-rosegold-300 dark:border-charcoal-800 bg-charcoal-100 dark:bg-charcoal-950/45">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selfiePreview} alt="Selfie preview" className="w-full h-full object-cover" />
                        
                        {isAnalyzing && (
                          <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-4">
                            {/* Scanning Animation */}
                            <div className="animate-scan"></div>
                            
                            <div className="text-center space-y-3 pt-6">
                              <RefreshCw className="w-8 h-8 text-gold-metallic animate-spin mx-auto" />
                              <div className="space-y-1">
                                <span className="block text-[10px] font-bold uppercase tracking-widest text-gold-light">Aura Scanning</span>
                                <p className="text-xs text-white font-medium animate-pulse">{scanStep}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="text-base font-bold text-charcoal-900 dark:text-white font-playfair">Ready for Analysis</h4>
                          <p className="text-xs text-charcoal-400">
                            We will evaluate your facial geometry, melanin scale, and hair structure to deliver custom recommendations.
                          </p>
                        </div>

                        {errorMsg && (
                          <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-500 flex items-center gap-2">
                            <XCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                          </div>
                        )}

                        {!isAnalyzing && (
                          <div className="flex gap-3">
                            <button
                              onClick={handleAnalyzeProfile}
                              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-rosegold-500 to-gold-metallic text-white font-semibold text-xs shadow-xs hover:scale-102 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Sparkles className="w-4 h-4" />
                              Analyze Profile
                            </button>
                            <label className="px-4 py-2.5 rounded-xl border border-rosegold-200 dark:border-charcoal-800 text-charcoal-700 dark:text-rosegold-200 text-xs font-semibold hover:bg-rosegold-50 dark:hover:bg-charcoal-900 transition-colors flex items-center justify-center cursor-pointer">
                              Change Photo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleSelfieChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* If profile exists */}
                  {beautyProfile && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Top Header details */}
                      <div className="flex justify-between items-center pb-2 border-b border-rosegold-200/40">
                        <div>
                          <h3 className="font-bold text-charcoal-950 dark:text-white text-lg font-playfair">Beauty Profile Summary</h3>
                          <span className="text-[10px] text-charcoal-400 font-mono">Last updated: {new Date(beautyProfile.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        
                        <label className="px-3.5 py-1.5 rounded-lg border border-rosegold-200 dark:border-charcoal-800 text-charcoal-700 dark:text-rosegold-200 text-[10px] uppercase font-bold tracking-wider hover:bg-rosegold-50 dark:hover:bg-charcoal-900 transition-colors cursor-pointer flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5" />
                          Update Profile
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              handleSelfieChange(e);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Display Results */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Summary & Core Metrics */}
                        <div className="lg:col-span-3 space-y-6">
                          
                          {/* Summary Card */}
                          <div className="p-6 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-955 shadow-2xs">
                            <h4 className="text-xs font-semibold text-rosegold-550 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              Active Diagnostics
                            </h4>
                            <p className="text-sm leading-relaxed text-charcoal-850 dark:text-rosegold-100 font-light italic">
                              &ldquo;{beautyProfile.beautySummary}&rdquo;
                            </p>
                          </div>

                          {/* Elegant Divider Row instead of boxes */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-rosegold-200/40">
                            <div className="space-y-1">
                              <span className="text-charcoal-400 uppercase tracking-wider text-[9px] font-semibold block">Face Shape</span>
                              <span className="font-bold text-sm text-charcoal-950 dark:text-white font-playfair">{beautyProfile.faceShape}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-charcoal-400 uppercase tracking-wider text-[9px] font-semibold block">Hair Type</span>
                              <span className="font-bold text-sm text-charcoal-950 dark:text-white font-playfair">{beautyProfile.hairType}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-charcoal-400 uppercase tracking-wider text-[9px] font-semibold block">Skin Tone</span>
                              <span className="font-bold text-sm text-charcoal-950 dark:text-white font-playfair">{beautyProfile.skinTone}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-charcoal-400 uppercase tracking-wider text-[9px] font-semibold block">Hair Length</span>
                              <span className="font-bold text-sm text-charcoal-955 dark:text-white font-playfair">{beautyProfile.hairLength}</span>
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                          
                          {/* Hairstyles Card */}
                          <div className="p-4 rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-rosegold-50/5 dark:bg-charcoal-950/5 space-y-3">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-950 dark:text-white flex items-center gap-1.5 pb-2 border-b border-rosegold-100 dark:border-charcoal-800 font-playfair">
                              <Sparkles className="w-3.5 h-3.5 text-rosegold-550" />
                              Recommended Hairstyles
                            </h4>
                            <ul className="space-y-2 text-xs">
                              {beautyProfile.recommendedHairstyles?.map((h, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-charcoal-700 dark:text-rosegold-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rosegold-500 mt-1.5 shrink-0" />
                                  <span>{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Treatments Card */}
                          <div className="p-4 rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-rosegold-50/5 dark:bg-charcoal-950/5 space-y-3">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-950 dark:text-white flex items-center gap-1.5 pb-2 border-b border-rosegold-100 dark:border-charcoal-800 font-playfair">
                              <Sparkles className="w-3.5 h-3.5 text-rosegold-550" />
                              Recommended Treatments
                            </h4>
                            <ul className="space-y-2 text-xs">
                              {beautyProfile.recommendedTreatments?.map((t, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-charcoal-700 dark:text-rosegold-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rosegold-500 mt-1.5 shrink-0" />
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Makeup Styles Card */}
                          <div className="p-4 rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-rosegold-50/5 dark:bg-charcoal-950/5 space-y-3">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-950 dark:text-white flex items-center gap-1.5 pb-2 border-b border-rosegold-100 dark:border-charcoal-800 font-playfair">
                              <Sparkles className="w-3.5 h-3.5 text-rosegold-550" />
                              Makeup Look Suggestions
                            </h4>
                            <ul className="space-y-2 text-xs">
                              {beautyProfile.recommendedMakeupStyles?.map((m, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-charcoal-700 dark:text-rosegold-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rosegold-500 mt-1.5 shrink-0" />
                                  <span>{m}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* Tab 3: Booking History */}
              {activeTab === 'bookings' && (
                <div className="space-y-4 animate-fade-in">
                  {sortedBookings.length > 0 ? (
                    <div className="space-y-3">
                      {sortedBookings.map((booking) => (
                        <div 
                          key={booking.id} 
                          className="p-4 rounded-xl border border-rosegold-200/60 dark:border-charcoal-800 bg-white dark:bg-charcoal-950/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-rosegold-300 dark:hover:border-charcoal-700 transition-colors"
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-charcoal-950 dark:text-white">{booking.serviceName}</h4>
                            <p className="text-xs text-charcoal-450 dark:text-rosegold-300">{booking.salonName}</p>
                            <div className="flex items-center gap-3 text-[11px] text-charcoal-400 mt-1.5 font-mono">
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-rosegold-500" /> {booking.date}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-rosegold-500" /> {booking.time}</span>
                              <span className="font-semibold text-charcoal-800 dark:text-white">₹{booking.price}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              booking.status === 'Confirmed' || booking.status === 'Completed'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                : booking.status === 'Cancelled'
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                : 'bg-charcoal-550/10 border-charcoal-550/20 text-charcoal-400'
                            }`}>
                              {booking.status}
                            </span>
                            {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                              <button
                                onClick={() => cancelBooking(booking.id)}
                                className="px-3 py-1.5 text-[10px] font-bold text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                              >
                                Cancel Visit
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed border-rosegold-200 dark:border-charcoal-800 rounded-2xl space-y-3">
                      <Calendar className="w-10 h-10 text-charcoal-300 mx-auto" />
                      <h4 className="text-base font-bold text-charcoal-800 dark:text-white">No Appointment History</h4>
                      <p className="text-xs text-charcoal-400 max-w-xs mx-auto">
                        You have not scheduled any luxury treatments yet.
                      </p>
                      <div className="pt-2">
                        <Link
                          href="/booking"
                          className="inline-block px-5 py-2 rounded-xl bg-rosegold-500 hover:bg-rosegold-600 text-white text-xs font-semibold cursor-pointer"
                        >
                          Book An Appointment
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Reviews */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Reviews List */}
                  <div className="space-y-3">
                    {userReviews.length > 0 ? (
                      userReviews.map((rev) => (
                        <div key={rev.id} className="p-4 rounded-xl border border-rosegold-200/60 dark:border-charcoal-800 bg-white dark:bg-charcoal-950/30 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-xs text-charcoal-950 dark:text-white uppercase tracking-wider">{rev.salonName}</h4>
                              <span className="text-[10px] text-charcoal-400 font-mono">{rev.date}</span>
                            </div>
                            <div className="flex items-center text-rosegold-500 font-bold text-xs">
                              <Star className="w-3.5 h-3.5 fill-rosegold-500 mr-1 text-rosegold-500" />
                              {rev.rating} / 5
                            </div>
                          </div>
                          <p className="text-xs text-charcoal-650 dark:text-rosegold-200 italic font-light">&ldquo;{rev.comment}&rdquo;</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-charcoal-400 text-xs font-light">
                        <MessageSquare className="w-8 h-8 mx-auto text-charcoal-300 mb-2" />
                        You haven&apos;t written any reviews yet. Share your feedback below.
                      </div>
                    )}
                  </div>

                  {/* Add Review Form */}
                  <form onSubmit={handleReviewSubmit} className="p-5 rounded-xl border border-dashed border-rosegold-200/80 dark:border-charcoal-800 bg-rosegold-50/5 dark:bg-charcoal-950/5 space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 dark:text-white flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-rosegold-550" />
                      Write a Review
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider mb-1.5">Select Outlet</label>
                        <select
                          value={reviewSalonId}
                          onChange={(e) => setReviewSalonId(e.target.value)}
                          required
                          className="block w-full px-3 py-2 text-xs rounded-lg border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
                        >
                          <option value="">-- Select Salon --</option>
                          {salons.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider mb-1.5">Rating</label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="block w-full px-3 py-2 text-xs rounded-lg border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
                        >
                          <option value={5}>5★ - Flawless Treatment</option>
                          <option value={4}>4★ - Great Experience</option>
                          <option value={3}>3★ - Average Visit</option>
                          <option value={2}>2★ - Subpar Service</option>
                          <option value={1}>1★ - Disappointing Treatment</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider mb-1.5">Share Your Opinion</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Tell us about the atmosphere, styling service quality, and therapist attentiveness..."
                        required
                        rows={3}
                        className="block w-full px-3 py-2 text-xs rounded-lg border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 placeholder-charcoal-400"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      {reviewSubmitted && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold flex items-center gap-1 animate-fade-in">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Review Published!
                        </span>
                      )}
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-lg bg-linear-to-r from-rosegold-500 to-gold-metallic text-white font-semibold text-[11px] shadow-xs hover:scale-101 hover:shadow-sm transition-all cursor-pointer ml-auto"
                      >
                        Publish Review
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>

          </div>

          {/* Right Panel: Favorites & Memory */}
          <aside className="space-y-6">
            
            {/* Favorite salons listing */}
            <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-855 bg-white dark:bg-charcoal-900 shadow-xs space-y-4">
              <h3 className="font-bold text-charcoal-950 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2 font-playfair">
                <Heart className="w-4 h-4 text-rosegold-550 fill-rosegold-500" />
                Favorite Salons
              </h3>
              
              <div className="space-y-3">
                {favoriteSalonsObj.length > 0 ? (
                  favoriteSalonsObj.map((fs) => (
                    <div key={fs.id} className="p-3 rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-rosegold-50/10 dark:bg-charcoal-950/20 flex justify-between items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-charcoal-900 dark:text-white truncate">{fs.name}</h4>
                        <p className="text-[10px] text-charcoal-400 flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-rosegold-550 shrink-0" />
                          <span className="truncate">{fs.location}</span>
                        </p>
                      </div>
                      <Link
                        href={`/salons/${fs.id}`}
                        className="text-[10px] font-semibold text-rosegold-500 hover:text-rosegold-650 flex items-center shrink-0"
                      >
                        View
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-charcoal-400 font-light italic text-center py-4">No saved outlets yet.</p>
                )}
              </div>
            </div>

            {/* Beauty Preferences AI Memory Panel */}
            <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-855 bg-white dark:bg-charcoal-900 shadow-xs space-y-5">
              <div className="space-y-1">
                <h3 className="font-bold text-charcoal-950 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2 font-playfair">
                  <Sparkles className="w-4 h-4 text-rosegold-550" />
                  Beauty Preferences
                </h3>
                <p className="text-[10px] text-charcoal-400 font-light italic">
                  Dynamically compiled from your booking activity & reviews
                </p>
              </div>

              {userMemory ? (
                <div className="space-y-4 text-xs">
                  {/* Preferred Services */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-semibold text-charcoal-450 uppercase tracking-wider">Preferred Services</span>
                    {userMemory.preferredServices && userMemory.preferredServices.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {userMemory.preferredServices.slice(0, 3).map((service, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-rosegold-50 dark:bg-charcoal-800 text-rosegold-650 dark:text-rosegold-300 rounded-md font-medium"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-charcoal-400 italic text-[11px]">No bookings recorded yet</p>
                    )}
                  </div>

                  {/* Preferred Locations */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-semibold text-charcoal-450 uppercase tracking-wider">Preferred Locations</span>
                    {userMemory.preferredLocations && userMemory.preferredLocations.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {userMemory.preferredLocations.slice(0, 2).map((loc, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-amber-550/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md font-medium flex items-center gap-1"
                          >
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            {loc}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-charcoal-400 italic text-[11px]">No location data yet</p>
                    )}
                  </div>

                  {/* Preferred Budget */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-semibold text-charcoal-450 uppercase tracking-wider">Preferred Budget</span>
                    <div className="p-2.5 rounded-lg bg-linear-to-r from-rosegold-50/50 to-gold-metallic/5 dark:from-charcoal-800 dark:to-charcoal-900 border border-rosegold-100 dark:border-charcoal-750 flex items-center justify-between">
                      <span className="text-charcoal-500 dark:text-charcoal-300 font-medium">Average Spending</span>
                      <span className="font-bold text-rosegold-600 dark:text-gold-metallic">
                        {userMemory.averageBudget > 0 ? `₹${userMemory.averageBudget}` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Favorite Categories */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-semibold text-charcoal-450 uppercase tracking-wider">Favorite Categories</span>
                    {userMemory.preferredCategories && userMemory.preferredCategories.length > 0 ? (
                      <div className="space-y-2">
                        {userMemory.preferredCategories.slice(0, 3).map((item, index) => {
                          const total = userMemory.preferredCategories.reduce((sum, c) => sum + c.score, 0);
                          const percentage = total > 0 ? Math.round((item.score / total) * 100) : 0;
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-medium text-charcoal-700 dark:text-white">{item.category} Salons</span>
                                <span className="text-charcoal-400">{percentage}%</span>
                              </div>
                              <div className="w-full bg-rosegold-100/50 dark:bg-charcoal-800 rounded-full h-1.5">
                                <div 
                                  className="bg-linear-to-r from-rosegold-500 to-gold-metallic h-1.5 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-charcoal-400 italic text-[11px]">No category data yet</p>
                    )}
                  </div>

                  {/* Recent Beauty Activity */}
                  <div className="space-y-2 pt-2 border-t border-rosegold-100 dark:border-charcoal-800">
                    <span className="block text-[10px] font-semibold text-charcoal-450 uppercase tracking-wider">Recent Beauty Activity</span>
                    {userMemory.bookingHistory && userMemory.bookingHistory.length > 0 ? (
                      <div className="space-y-2.5">
                        {userMemory.bookingHistory.slice(0, 3).map((activity, index) => (
                          <div key={index} className="flex gap-2.5 items-start">
                            <div className={`p-1.5 rounded-md ${
                              activity.status === 'Completed' || activity.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            } mt-0.5`}>
                              <CheckCircle className="w-3.5 h-3.5" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="block font-medium text-[11px] text-charcoal-800 dark:text-white truncate max-w-[180px]">
                                {activity.serviceName} at {activity.salonName}
                              </span>
                              <span className="block text-[9px] text-charcoal-400 font-mono">
                                {activity.date} • {activity.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-charcoal-400 italic text-[11px]">No recent activity</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-charcoal-400 text-xs italic">
                  Compiling your preferences...
                </div>
              )}
            </div>

          </aside>

        </div>

      </main>

      <Footer />
    </div>
  );
}
