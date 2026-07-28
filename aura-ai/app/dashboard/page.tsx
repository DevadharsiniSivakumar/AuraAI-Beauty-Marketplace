'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Heart,
  Compass,
  LogOut,
  ArrowLeft,
  Clock,
  User,
  Star,
  ExternalLink,
  Store,
  Scissors,
  ChevronRight,
  TrendingUp,
  Camera,
  MessageSquare,
  Sparkles,
  CheckCircle,
  MapPin
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { bookings, salons, userProfile, activeJourney, userMemory, saveJourney, deleteActiveJourney } = useApp();

  const [goalInput, setGoalInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [visibleSalonsForStep, setVisibleSalonsForStep] = useState<Record<number, boolean>>({});

  const quickGoals = [
    { label: 'Wedding in 45 days', text: 'My wedding is in 45 days. I need a complete glow-up plan for skin and hair.' },
    { label: 'Party next week', text: 'I have a major party next week and need to look my absolute best.' },
    { label: 'Dry/damaged hair recovery', text: 'My hair is severely dry and damaged. I need a recovery journey.' },
    { label: 'Acne & skin glow', text: 'I want to clear up my skin congestion and get a healthy radiant glow.' }
  ];

  const getMatchingSalonsForService = (serviceName: string) => {
    const query = serviceName.toLowerCase();
    return salons.map((salon: any) => {
      const matchingServices = (salon.services || []).filter((s: any) => 
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
    }).filter((s: any): s is any => s !== null);
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
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'saved' | 'journey'>('overview');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'bookings' || tab === 'saved' || tab === 'journey' || tab === 'overview') {
        setActiveTab(tab as any);
      }
    }
  }, []);

  const favorites = userProfile?.favoriteSalons || [];
  const userBookings = bookings.filter(b => b.userId === user?.uid || b.userEmail === user?.email);
  
  // Sort bookings
  const upcomingBookings = userBookings
    .filter(b => new Date(`${b.date}T${b.time.replace(/ AM| PM/, '')}`) >= new Date() || b.status === 'Confirmed' || b.status === 'Pending')
    .sort((a, b) => new Date(`${a.date}T${a.time.replace(/ AM| PM/, '')}`).getTime() - new Date(`${b.date}T${b.time.replace(/ AM| PM/, '')}`).getTime());
    
  const pastBookings = userBookings
    .filter(b => b.status === 'Completed' || b.status === 'Cancelled' || new Date(`${b.date}T${b.time.replace(/ AM| PM/, '')}`) < new Date())
    .sort((a, b) => new Date(`${b.date}T${b.time.replace(/ AM| PM/, '')}`).getTime() - new Date(`${a.date}T${a.time.replace(/ AM| PM/, '')}`).getTime());

  const savedSalons = salons.filter(s => favorites.includes(s.id));
  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="flex h-screen bg-cream overflow-hidden text-darktext">
      
      {/* Sidebar - Identical in shape/color to Admin sidebar */}
      <aside className="w-64 bg-plum text-warmwhite flex flex-col flex-shrink-0 shadow-xl border-r border-plum-dark/40 z-20">
        <div className="h-20 flex items-center px-6 border-b border-plum-dark/50 gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0c051a] flex items-center justify-center border border-rosegold-300/40">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover scale-[1.7]" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-wide text-white">Aura Hub</span>
        </div>
        
        {/* Navigation Sidebar List */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach' 
                : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-peach" />
            Overview
          </button>

          <Link 
            href="/salons"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <Store className="w-4 h-4 text-peach" />
            Explore Salons
          </Link>

          <button 
            onClick={() => setActiveTab('saved')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'saved' 
                ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach' 
                : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4 text-peach" />
            Saved Salons
          </button>

          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'bookings' 
                ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach' 
                : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-peach" />
            My Bookings
          </button>

          <button 
            onClick={() => setActiveTab('journey')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'journey' 
                ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach' 
                : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-peach" />
            Beauty Journey
          </button>


          <Link 
            href="/advisor"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <Camera className="w-4 h-4 text-peach" />
            Selfie Scanner
          </Link>

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
        
        {/* Top Header - Matching Admin console header */}
        <header className="h-20 bg-white border-b border-border flex items-center justify-between px-8 flex-shrink-0 shadow-xs z-10">
          <h2 className="text-xl font-serif font-bold text-darktext capitalize">
            {activeTab === 'saved' ? 'Saved Salons' : activeTab === 'bookings' ? 'My Bookings' : activeTab === 'journey' ? 'Beauty Journey' : 'Client Overview'}
          </h2>
          
          <div className="flex items-center gap-3.5">
            <div className="text-right">
              <p className="text-xs font-bold text-darktext">{userName}</p>
              <p className="text-[10px] text-mutedtext">{user?.email || 'Authenticated client'}</p>
            </div>
            <Link href="/profile" className="w-10 h-10 rounded-full bg-plum text-warmwhite flex items-center justify-center font-bold text-sm shadow-md border-2 border-peach hover:scale-105 transition-transform cursor-pointer">
              {userInitials}
            </Link>
          </div>
        </header>

        {/* Content Workspace */}
        <main className="flex-grow overflow-y-auto p-8 bg-cream/40">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in">
              
              {/* AI Concierge Banner */}
              <div className="bg-gradient-to-r from-plum to-plum-dark rounded-2xl p-6 md:p-8 text-warmwhite flex flex-col md:flex-row items-center justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-peach opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                <div className="relative z-10 space-y-2 mb-6 md:mb-0">
                  <h3 className="font-serif text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-peach" />
                    AI Concierge
                  </h3>
                  <p className="text-warmwhite/80 max-w-lg text-sm leading-relaxed">
                    Need help planning your perfect beauty routine? Chat with our AI concierge for personalized recommendations, style advice, and instant answers.
                  </p>
                </div>
                <Link 
                  href="/concierge" 
                  className="relative z-10 shrink-0 bg-white text-plum px-6 py-3 rounded-lg font-bold text-sm hover:bg-peach hover:text-white transition-all shadow-sm"
                >
                  Start Conversation
                </Link>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-plum/10 text-plum flex items-center justify-center border border-plum/20">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-mutedtext uppercase tracking-wider">Next Booking</p>
                    <p className="text-sm font-semibold text-darktext mt-1 truncate max-w-[150px]">
                      {upcomingBookings.length > 0 ? `${upcomingBookings[0].date}` : 'None Scheduled'}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-peach/10 text-peach flex items-center justify-center border border-peach/20">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-mutedtext uppercase tracking-wider">Saved Salons</p>
                    <p className="text-2xl font-serif font-bold text-darktext mt-1">{savedSalons.length}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-sage/10 text-sage flex items-center justify-center border border-sage/20">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-mutedtext uppercase tracking-wider">Total Visits</p>
                    <p className="text-2xl font-serif font-bold text-darktext mt-1">{pastBookings.length}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-lavender/10 text-lavender flex items-center justify-center border border-lavender/20">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-mutedtext uppercase tracking-wider">Journey Plan</p>
                    <p className="text-sm font-semibold text-darktext mt-1 truncate max-w-[150px]">
                      {activeJourney ? activeJourney.goal : 'No Active Plan'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content Splits */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Horizontal Booking and Journey Columns */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Next Appointment Card */}
                  <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
                    <h3 className="font-serif font-bold text-darktext text-lg">Upcoming Appointment</h3>
                    
                    {upcomingBookings.length > 0 ? (
                      <div className="border border-border rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center relative overflow-hidden bg-cream/10">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-plum"></div>
                        
                        <div className="flex-shrink-0 bg-white p-3.5 rounded-xl text-center border border-border min-w-[90px]">
                          <span className="block text-xs text-plum font-bold uppercase tracking-wider">
                            {new Date(upcomingBookings[0].date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="block font-serif text-2xl font-bold text-darktext mt-0.5">
                            {new Date(upcomingBookings[0].date).getDate()}
                          </span>
                          <span className="block text-[10px] text-mutedtext font-medium mt-1 uppercase">
                            {upcomingBookings[0].time}
                          </span>
                        </div>
                        
                        <div className="flex-grow">
                          <h4 className="font-bold text-base text-darktext">{upcomingBookings[0].salonName}</h4>
                          <p className="text-xs text-mutedtext mt-1">{upcomingBookings[0].serviceName}</p>
                          <div className="flex gap-4 mt-3.5">
                            <Link href={`/salons/${upcomingBookings[0].salonId}`} className="text-xs font-bold text-plum hover:text-plum-dark transition-colors flex items-center gap-0.5">
                              View Outlet <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <span className="px-3 py-1 bg-sage/10 text-sage text-xs font-bold rounded-lg border border-sage/20 uppercase tracking-wide">
                            {upcomingBookings[0].status || 'Confirmed'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-border rounded-2xl p-8 text-center bg-cream/5">
                        <p className="text-xs text-mutedtext mb-4">No upcoming beauty treatments scheduled.</p>
                        <button 
                          onClick={() => router.push('/salons')}
                          className="px-5 py-2 bg-plum text-warmwhite text-xs font-bold rounded-xl hover:bg-plum-dark transition-colors cursor-pointer"
                        >
                          Find a Beauty Salon
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Active Beauty Journey Summary */}
                  <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-serif font-bold text-darktext text-lg">Active AI Journey</h3>
                      <button 
                        onClick={() => setActiveTab('journey')}
                        className="text-xs font-bold text-plum hover:underline"
                      >
                        Open Planner
                      </button>
                    </div>

                    {activeJourney ? (
                      <div className="border border-border rounded-2xl p-5 space-y-5 bg-cream/5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-darktext">{activeJourney.goal}</h4>
                            <p className="text-xs text-mutedtext mt-0.5">Type: {activeJourney.journeyType}</p>
                          </div>
                          <span className="text-xs font-bold bg-plum/10 text-plum px-2.5 py-1 rounded-lg border border-plum/10">
                            {activeJourney.progressPercent || 0}% Completed
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-cream border border-border">
                            <div 
                              style={{ width: `${activeJourney.progressPercent || 0}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-plum"
                            ></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-border rounded-2xl p-8 text-center bg-cream/5">
                        <p className="text-xs text-mutedtext mb-4">No active beauty preparations tracked. Let Aura craft a custom wedding, holiday, or skincare prep planner.</p>
                        <button 
                          onClick={() => router.push('/journey')}
                          className="px-5 py-2 bg-plum text-warmwhite text-xs font-bold rounded-xl hover:bg-plum-dark transition-colors cursor-pointer"
                        >
                          Launch Journey Planner
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Column Sidebar Lists */}
                <div className="space-y-8 col-span-1">
                  
                  {/* Saved Salons Quicklist */}
                  <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-serif font-bold text-darktext text-base">Favorite Outlets</h3>
                      <button 
                        onClick={() => setActiveTab('saved')}
                        className="text-xs font-bold text-plum hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    {savedSalons.length > 0 ? (
                      <div className="divide-y divide-border">
                        {savedSalons.slice(0, 3).map(salon => (
                          <Link 
                            key={salon.id} 
                            href={`/salons/${salon.id}`}
                            className="flex items-center gap-3.5 py-3 hover:bg-cream/10 rounded-xl px-1.5 transition-colors -mx-1.5"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0">
                              <img src={salon.image} alt={salon.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs text-darktext truncate">{salon.name}</h4>
                              <p className="text-[10px] text-mutedtext truncate mt-0.5">{salon.locality}</p>
                            </div>
                            <span className="text-gold font-bold text-[10px] bg-gold/10 px-1.5 py-0.5 rounded border border-gold/20 flex items-center gap-0.5">
                              ★ {salon.rating}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-mutedtext text-center py-4">No favorited outlets yet.</p>
                    )}
                  </div>

                  {/* Past Visits Quicklist */}
                  <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
                    <h3 className="font-serif font-bold text-darktext text-base">Past Beauty Treatments</h3>

                    {pastBookings.length > 0 ? (
                      <div className="space-y-3.5">
                        {pastBookings.slice(0, 2).map(booking => (
                          <div key={booking.id} className="p-3 border border-border bg-cream/10 rounded-xl space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-xs text-darktext truncate">{booking.salonName}</h4>
                              <span className="text-[9px] text-mutedtext whitespace-nowrap font-mono">{booking.date}</span>
                            </div>
                            <p className="text-[10px] text-mutedtext">{booking.serviceName}</p>
                            <div className="pt-2 flex justify-between items-center border-t border-border mt-2">
                              <span className="text-[10px] font-bold text-plum">INR {booking.price}</span>
                              <div className="flex items-center gap-2">
                                <Link 
                                  href={`/reviews?salon=${booking.salonId}`}
                                  className="text-[9px] font-bold text-sage hover:underline font-sans"
                                >
                                  Write Review
                                </Link>
                                <span className="text-[9px] font-semibold text-sage bg-sage/10 px-1.5 py-0.5 rounded">Visited</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-mutedtext text-center py-4">No past visits recorded.</p>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* MY BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-border bg-cream/10">
                <h3 className="font-serif font-bold text-darktext text-lg">My Appointments & Bookings</h3>
                <p className="text-xs text-mutedtext mt-1">Track pending treatments, active appointments, and historical bookings.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-cream/20 text-mutedtext text-xs uppercase font-bold">
                      <th className="p-4 pl-6">Salon Outlet</th>
                      <th className="p-4">Service Details</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4 text-right">Price</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {userBookings.length > 0 ? userBookings.map((booking, i) => (
                      <tr key={i} className="hover:bg-cream/10 transition-colors">
                        <td className="p-4 pl-6 font-bold text-darktext">{booking.salonName}</td>
                        <td className="p-4 text-mutedtext">{booking.serviceName}</td>
                        <td className="p-4">
                          <span className="font-medium text-darktext">{booking.date}</span>
                          <span className="block text-xs text-mutedtext mt-0.5">{booking.time}</span>
                        </td>
                        <td className="p-4 text-right font-bold text-darktext">INR {booking.price}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border ${
                            booking.status === 'Confirmed' ? 'bg-sage/10 text-sage border-sage/20' :
                            booking.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            booking.status === 'Completed' ? 'bg-plum/10 text-plum border-plum/20' :
                            'bg-rose/10 text-rose border-rose/20'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4 text-center pr-6">
                          <div className="flex items-center justify-center gap-2">
                            <Link 
                              href={`/salons/${booking.salonId}`}
                              className="inline-flex items-center gap-1 text-plum hover:text-plum-dark font-bold text-xs border border-plum/10 px-2.5 py-1 rounded-lg bg-plum/5 hover:bg-plum/10 transition-colors"
                            >
                              View Salon
                            </Link>
                            {booking.status === 'Completed' && (
                              <Link 
                                href={`/reviews?salon=${booking.salonId}`}
                                className="inline-flex items-center gap-1 text-sage hover:text-sage-dark font-bold text-xs border border-sage/20 px-2.5 py-1 rounded-lg bg-sage/10 hover:bg-sage/20 transition-colors font-sans"
                              >
                                Write Review
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-mutedtext">No appointments found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SAVED SALONS TAB */}
          {activeTab === 'saved' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-border shadow-xs bg-cream/10">
                <h3 className="font-serif font-bold text-darktext text-lg">Favorite Outlets</h3>
                <p className="text-xs text-mutedtext mt-1">Access your saved salons and easily schedule appointments.</p>
              </div>

              {savedSalons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {savedSalons.map((salon) => (
                    <div key={salon.id} className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                      <div>
                        <div className="h-44 overflow-hidden relative border-b border-border">
                          <img src={salon.image} alt={salon.name} className="w-full h-full object-cover" />
                          <span className="absolute top-3 right-3 bg-plum text-warmwhite text-[10px] font-bold px-2 py-0.5 rounded-lg border border-plum-dark/20 uppercase tracking-wide">
                            {salon.isLuxury ? 'Luxury' : salon.offersHomeService ? 'Home Service' : 'Budget'}
                          </span>
                        </div>
                        <div className="p-5 space-y-2">
                          <h4 className="font-serif font-bold text-darktext text-base">{salon.name}</h4>
                          <p className="text-xs text-mutedtext">{salon.address}</p>
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-gold font-bold text-sm bg-gold/10 px-2 py-0.5 rounded-lg border border-gold/20 flex items-center gap-1">
                              ★ {salon.rating}
                            </span>
                            <span className="text-xs text-mutedtext">({salon.reviewsCount} verified reviews)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5 pt-0 border-t border-border bg-cream/5 mt-4 flex gap-3">
                        <Link 
                          href={`/salons/${salon.id}`}
                          className="flex-1 text-center py-2 bg-plum text-warmwhite text-xs font-bold rounded-xl hover:bg-plum-dark transition-colors"
                        >
                          Book Treatment
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-border rounded-2xl p-12 text-center bg-cream/5">
                  <p className="text-sm text-mutedtext mb-4">You haven't saved any salons to your account yet.</p>
                  <button 
                    onClick={() => router.push('/salons')}
                    className="px-6 py-2.5 bg-plum text-warmwhite text-xs font-bold rounded-xl hover:bg-plum-dark transition-colors cursor-pointer"
                  >
                    Browse Salons Directory
                  </button>
                </div>
              )}
            </div>
          )}

          {/* BEAUTY JOURNEY TAB */}
          {activeTab === 'journey' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-border shadow-xs bg-cream/10 flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-darktext text-lg">Beauty Journey Console</h3>
                  <p className="text-xs text-mutedtext mt-1">Track saved timelines or generate new goal preps with Aura AI.</p>
                </div>
                {activeJourney && (
                  <button 
                    onClick={async () => {
                      if (confirm('Are you sure you want to discard your current plan? This will clear your tracking history.')) {
                        await deleteActiveJourney();
                        setGeneratedPlan(null);
                        setGoalInput('');
                        setSaveSuccess(false);
                      }
                    }}
                    className="px-3.5 py-1.5 border border-rose/30 hover:bg-rose/10 text-rose text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Reset Active Plan
                  </button>
                )}
              </div>

              {activeJourney ? (
                <div className="bg-white rounded-2xl border border-border shadow-xs p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
                    <div>
                      <h4 className="font-serif font-bold text-darktext text-xl">{activeJourney.goal}</h4>
                      <p className="text-xs text-mutedtext mt-1">Type: <span className="font-semibold text-darktext">{activeJourney.journeyType}</span></p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold bg-plum text-warmwhite px-3 py-1.5 rounded-xl">
                        {activeJourney.progressPercent || 0}% Progress
                      </span>
                      <span className="text-[10px] text-mutedtext mt-1">{Math.ceil(activeJourney.durationDays / 7)} weeks duration</span>
                    </div>
                  </div>

                  {/* Timelines and Steps list */}
                  <div className="space-y-6">
                    <h4 className="font-serif font-bold text-darktext text-base">Milestone Treatment Steps</h4>
                    <div className="relative border-l-2 border-border pl-6 ml-4 space-y-6">
                      {(activeJourney.steps || []).map((step, i) => (
                        <div key={i} className="relative">
                          {/* Dot indicator */}
                          <div className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white ring-2 ring-plum z-10 ${
                            step.status === 'Completed' ? 'bg-plum' :
                            step.status === 'In Progress' ? 'bg-peach' : 'bg-cream'
                          }`}></div>
                          
                          <div className="bg-cream/10 border border-border p-4 rounded-xl space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="font-bold text-sm text-darktext">{step.title}</h5>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                step.status === 'Completed' ? 'bg-sage/10 text-sage border-sage/20' :
                                step.status === 'In Progress' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                'bg-cream text-mutedtext border-border'
                              }`}>
                                {step.status}
                              </span>
                            </div>
                            <p className="text-xs text-mutedtext leading-relaxed">{step.description}</p>
                            <div className="pt-2 border-t border-border/60 flex justify-between items-center mt-2">
                              <span className="text-[10px] text-mutedtext font-bold uppercase tracking-wider">Timeline: {step.timeline}</span>
                              <Link 
                                href="/salons"
                                className="text-[10px] font-bold text-plum hover:text-plum-dark font-sans"
                              >
                                Find Provider &rarr;
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-serif font-bold text-lg text-darktext flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-plum animate-pulse" />
                        Define Your Beauty Goal
                      </h3>
                      <p className="text-xs text-mutedtext leading-relaxed">
                        Tell Aura what you want to prepare for or recover from. We will design a customized, multi-week timeline.
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {quickGoals.map((qg: any) => (
                        <button
                          key={qg.label}
                          onClick={() => setGoalInput(qg.text)}
                          className="text-[11px] bg-cream hover:bg-cream-dark border border-border text-mutedtext px-3.5 py-1.5 rounded-full transition-colors text-left font-semibold cursor-pointer"
                        >
                          {qg.label}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleGenerateJourney} className="space-y-4 pt-2">
                      <textarea
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder="e.g. My wedding is in 45 days and I want perfect skin and silky smooth hair..."
                        className="w-full bg-cream border border-border text-darktext text-sm rounded-xl p-4 focus:outline-none focus:border-plum resize-none"
                        rows={4}
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={generating || !goalInput.trim()}
                          className="px-5 py-3 bg-plum text-warmwhite rounded-xl hover:bg-plum-dark text-xs font-bold transition-all disabled:opacity-50 disabled:bg-border cursor-pointer flex items-center gap-2"
                        >
                          {generating ? (
                            <>
                              <div className="w-3 h-3 rounded-full border-2 border-warmwhite border-t-transparent animate-spin"></div>
                              Generating Journey Plan...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-peach animate-pulse" />
                              Generate Journey Plan
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {generating && (
                    <div className="bg-white p-8 rounded-xl border border-border h-full min-h-[300px] flex flex-col items-center justify-center space-y-4 shadow-sm animate-pulse">
                      <div className="w-12 h-12 bg-cream rounded-full border-4 border-plum border-t-transparent animate-spin"></div>
                      <p className="text-mutedtext font-medium text-xs">Aura is designing your schedule...</p>
                    </div>
                  )}

                  {generatedPlan && !generating && (
                    <div className="space-y-8 animate-in fade-in">
                      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-plum/10 border border-plum/20 text-plum tracking-widest uppercase">
                            {generatedPlan.journeyType} Journey
                          </span>
                          <h3 className="text-2xl font-bold text-darktext">
                            Your Beauty Roadmap ({generatedPlan.durationDays} Days)
                          </h3>
                          <p className="text-xs text-mutedtext">
                            Goal: &ldquo;{goalInput}&rdquo;
                          </p>
                        </div>

                        {saveSuccess ? (
                          <div className="px-5 py-2.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-600 rounded-xl font-bold text-xs flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 animate-bounce" />
                            Saved to Profile
                          </div>
                        ) : (
                          <button
                            onClick={handleSaveJourney}
                            className="px-5 py-2.5 bg-plum hover:bg-plum-dark text-white rounded-xl font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            Save Journey to Profile
                          </button>
                        )}
                      </div>

                      <div className="relative pl-6 sm:pl-8 border-l border-border space-y-10">
                        {generatedPlan.steps.map((step: any) => {
                          const matchedSalons = getMatchingSalonsForService(step.recommendedService);
                          const isSalonsVisible = visibleSalonsForStep[step.stepNumber];

                          return (
                            <div key={step.stepNumber} className="relative group">
                              <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full border-2 border-border bg-white flex items-center justify-center font-bold text-[10px] text-mutedtext">
                                {step.stepNumber}
                              </div>

                              <div className="rounded-xl border border-border bg-white p-6 hover:border-plum/40 transition-colors shadow-sm space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <span className="text-[10px] font-bold text-mutedtext uppercase tracking-widest bg-cream px-2 py-0.5 rounded-md">
                                    {step.timeline}
                                  </span>
                                  <h4 className="text-base font-bold text-darktext">
                                    {step.title}
                                  </h4>
                                </div>

                                <p className="text-xs sm:text-sm text-mutedtext leading-relaxed font-light">
                                  {step.description}
                                </p>

                                <div className="pt-2 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                  <div className="text-xs">
                                    <span className="text-mutedtext">Recommended service:</span>{' '}
                                    <strong className="text-darktext">{step.recommendedService}</strong>
                                  </div>
                                  <button
                                    onClick={() => setVisibleSalonsForStep(prev => ({
                                      ...prev,
                                      [step.stepNumber]: !prev[step.stepNumber]
                                    }))}
                                    className="px-3.5 py-1.5 border border-border hover:bg-cream text-[10px] font-bold text-darktext rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    {isSalonsVisible ? 'Hide Salons' : 'Find Salons'}
                                    <ChevronRight className={`w-3 h-3 transition-transform ${isSalonsVisible ? 'rotate-90' : ''}`} />
                                  </button>
                                </div>

                                {isSalonsVisible && (
                                  <div className="pt-4 border-t border-dashed border-border space-y-3">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-mutedtext">
                                      Nearby Salons offering this treatment
                                    </p>

                                    {matchedSalons.length > 0 ? (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {matchedSalons.slice(0, 2).map((salon: any) => (
                                          <div 
                                            key={salon.id} 
                                            className="p-4 rounded-xl border border-border bg-white flex flex-col justify-between gap-3 hover:border-plum/20 transition-all shadow-xs"
                                          >
                                            <div>
                                              <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-semibold text-mutedtext">
                                                  {salon.matchedService.name} (₹{salon.matchedService.price})
                                                </span>
                                                <div className="flex text-mutedtext items-center font-bold">
                                                  <Star className="w-3.5 h-3.5 fill-rosegold-500 mr-0.5" />
                                                  {salon.rating}
                                                </div>
                                              </div>
                                              <h5 className="text-xs font-bold text-darktext mt-1">
                                                {salon.name}
                                              </h5>
                                              <p className="text-[10px] text-mutedtext flex items-center mt-0.5">
                                                <MapPin className="w-2.5 h-2.5 text-mutedtext mr-0.5" />
                                                {salon.locality}
                                              </p>
                                            </div>

                                            <Link
                                              href={`/booking?salon=${salon.id}&service=${salon.matchedService.id}`}
                                              className="w-full py-1.5 text-center rounded-lg bg-plum text-warmwhite hover:bg-plum-dark text-[10px] font-bold transition-colors font-sans"
                                            >
                                              Book Step Appointment
                                            </Link>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-mutedtext py-2 italic">
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
                </div>
              )}
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
