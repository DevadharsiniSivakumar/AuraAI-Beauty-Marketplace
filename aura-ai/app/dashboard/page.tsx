'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  User, 
  Scissors, 
  Star, 
  Heart, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  MessageCircle,
  UploadCloud,
  XCircle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Info,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const { 
    userProfile, 
    bookings, 
    salons, 
    cancelBooking,
    activeJourney,
    updateJourneyStepStatus,
    deleteActiveJourney
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);

  const upcomingBookings = bookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'In Progress');
  const completedBookings = bookings.filter(b => b.status === 'Completed');
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled' || b.status === 'No Show');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/salons?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/salons');
    }
  };

  // V2 Proactive insights data array
  const proactiveInsights = [
    {
      id: 'ins-1',
      type: 'Calendar Alert',
      text: "You haven't booked a hair spa in 90 days. Scheduling one is recommended to maintain follicle hydration.",
      actionLabel: "Book Hair Spa",
      link: "/booking?salon=bodycraft-indiranagar&service=bc-massage-1",
      severity: 'normal'
    },
    {
      id: 'ins-2',
      type: 'Price Drop Alert',
      text: "Advanced Hydra Facial prices are trending 10% lower this month. Book now to lock in seasonal pricing.",
      actionLabel: "Lock Price (₹4500)",
      link: "/booking?salon=bodycraft-indiranagar&service=bc-facial-1",
      severity: 'price'
    },
    {
      id: 'ins-3',
      type: 'Bridal Milestone',
      text: "Your wedding is in 20 days. Consider booking a bridal consultation at Play Salon UB City.",
      actionLabel: "Plan Bridal Prep",
      link: "/booking?salon=play-salon-vittal-mallya&service=play-bridal-1",
      severity: 'high'
    },
    {
      id: 'ins-4',
      type: 'Beauty DNA Hint',
      text: "Your previous skincare preferences indicate interest in advanced facial treatments. Consider checking Mirror & Within.",
      actionLabel: "View Mirror & Within",
      link: "/salons/mirror-within-lavelle",
      severity: 'normal'
    },
    {
      id: 'ins-5',
      type: 'Memory Trigger',
      text: "Based on your reviews, you prefer premium salon experiences. We have tailored your match scores accordingly.",
      actionLabel: "Explore Matches",
      link: "/salons?luxury=true",
      severity: 'normal'
    }
  ];

  // Dynamic Beauty Journey Timeline & stats
  const activePhase = activeJourney
    ? (activeJourney.steps.find(s => s.status === 'In Progress') || 
       activeJourney.steps.find(s => s.status === 'Pending') || 
       activeJourney.steps[activeJourney.steps.length - 1])
    : null;

  const completedStepsCount = activeJourney
    ? activeJourney.steps.filter(s => s.status === 'Completed').length
    : 0;

  const totalStepsCount = activeJourney
    ? activeJourney.steps.length
    : 0;

  const upcomingStep = activeJourney
    ? activeJourney.steps.find(s => s.status === 'Pending' || s.status === 'In Progress')
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Top Section: Welcome & Global Search */}
        <section className="relative rounded-3xl overflow-hidden border border-rosegold-200/40 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 p-6 sm:p-8 flex flex-col gap-6 shadow-2xs">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-950 dark:text-white font-playfair">
              Welcome back, {userProfile.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-charcoal-550 dark:text-rosegold-200">
              Your profile is synchronized. Discover bespoke luxury treatments matching your skin and location.
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search salons, services, or treatments (e.g., Hydra Facial, Hair Color)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs sm:text-sm pl-11 pr-24 py-3.5 rounded-2xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 placeholder-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white shadow-2xs"
            />
            <Search className="absolute left-4 top-4 w-5 h-5 text-charcoal-400" />
            <button
              type="submit"
              className="absolute right-2 top-2 px-5 py-2 rounded-xl bg-linear-to-r from-rosegold-500 to-gold-metallic hover:from-rosegold-600 hover:to-gold-dark text-white text-xs font-bold transition-all"
            >
              Search
            </button>
          </form>
        </section>

        {/* Quick Actions Section (4 Large Clickable Cards) */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-400">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Link
              href="/salons"
              className="p-6 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:scale-102 hover:border-rosegold-400 dark:hover:border-rosegold-800 transition-all flex items-center space-x-4 group shadow-2xs cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-rosegold-500/10 text-rosegold-500 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-bold text-charcoal-900 dark:text-white">Explore Salons</p>
                <p className="text-xs text-charcoal-400 font-light">Find local beauty hubs</p>
              </div>
            </Link>

            <Link
              href="/profile?tab=bookings"
              className="p-6 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:scale-102 hover:border-rosegold-400 dark:hover:border-rosegold-800 transition-all flex items-center space-x-4 group shadow-2xs cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-rosegold-500/10 text-rosegold-500 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-bold text-charcoal-900 dark:text-white">My Bookings</p>
                <p className="text-xs text-charcoal-400 font-light">Track schedules & visits</p>
              </div>
            </Link>

            <Link
              href="/concierge"
              className="p-6 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:scale-102 hover:border-rosegold-400 dark:hover:border-rosegold-800 transition-all flex items-center space-x-4 group shadow-2xs cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-rosegold-500/10 text-rosegold-500 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-bold text-charcoal-900 dark:text-white">Concierge</p>
                <p className="text-xs text-charcoal-400 font-light">Consult beauty agent</p>
              </div>
            </Link>

            <Link
              href="/advisor"
              className="p-6 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:scale-102 hover:border-rosegold-400 dark:hover:border-rosegold-800 transition-all flex items-center space-x-4 group shadow-2xs cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-rosegold-500/10 text-rosegold-500 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-bold text-charcoal-900 dark:text-white">Style Advisor</p>
                <p className="text-xs text-charcoal-400 font-light">Upload photo for advice</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Upcoming Bookings Section */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-charcoal-950 dark:text-white flex items-center font-playfair border-b border-rosegold-200/30 pb-2">
            <Calendar className="w-5 h-5 text-rosegold-550 mr-2" />
            Upcoming Bookings
          </h3>

          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingBookings.map((b) => (
                <div 
                  key={b.id}
                  className="p-4 rounded-xl border border-rosegold-200/60 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-rosegold-300 transition-colors shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        b.status === 'Confirmed' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-355' :
                        b.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-955/50 text-blue-800 dark:text-blue-350' :
                        'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-350'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-charcoal-900 dark:text-white">{b.serviceName}</h4>
                    <p className="text-xs text-charcoal-550 dark:text-rosegold-300">{b.salonName}</p>
                    <div className="flex items-center space-x-4 text-xs text-charcoal-400 pt-1">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {b.date}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {b.time}
                      </span>
                      <span className="font-semibold text-charcoal-700 dark:text-rosegold-100">
                        ₹{b.price}
                      </span>
                    </div>
                  </div>
                  {b.status !== 'In Progress' && (
                    <button
                      onClick={() => cancelBooking(b.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-955/50 text-red-650 dark:text-red-350 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-rosegold-200 dark:border-charcoal-800 rounded-xl space-y-3 bg-white dark:bg-charcoal-900">
              <Calendar className="w-8 h-8 text-charcoal-300 mx-auto" />
              <p className="text-sm font-semibold text-charcoal-700 dark:text-rosegold-200">No upcoming bookings</p>
              <p className="text-xs text-charcoal-400 max-w-xs mx-auto">You don't have any treatments scheduled. Treat yourself today.</p>
              <div className="pt-2">
                <Link 
                  href="/booking"
                  className="inline-flex items-center px-5 py-2 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic text-white text-xs font-bold transition-all shadow-md hover:scale-102 cursor-pointer"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Recommended Salons Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end border-b border-rosegold-200/40 pb-2">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-charcoal-955 dark:text-white flex items-center font-playfair">
                <Sparkles className="w-5 h-5 text-rosegold-550 mr-2" />
                Recommended Salons
              </h3>
              <p className="text-xs text-charcoal-500">Selections generated dynamically based on your skin type (Warm Beige) and location.</p>
            </div>
            <Link 
              href="/salons"
              className="text-xs font-bold text-rosegold-550 hover:text-rosegold-650 flex items-center gap-0.5 hover:underline cursor-pointer font-sans"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {salons.slice(0, 3).map((salon) => {
              const startingPrice = Math.min(...(salon.services || []).map(s => s.price));
              return (
                <div 
                  key={salon.id}
                  className="rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 p-4.5 flex flex-col justify-between space-y-4 hover:border-rosegold-350 transition-colors shadow-2xs group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-linear-to-r from-rosegold-500 to-rosegold-600 text-white">
                        {salon.matchScore}% Match
                      </span>
                      <div className="flex text-rosegold-550 text-xs items-center font-bold">
                        <Star className="w-3.5 h-3.5 fill-rosegold-500 mr-0.5" />
                        {salon.rating}
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-charcoal-900 dark:text-white line-clamp-1">{salon.name}</h4>
                    <p className="text-xs text-charcoal-400">{salon.locality}</p>
                    
                    {/* Why Aura Recommended This */}
                    <div className="space-y-1.5 pt-2.5 border-t border-rosegold-200/30">
                      <p className="text-[9px] font-semibold text-charcoal-450 dark:text-rosegold-300 uppercase tracking-wider">Why Aura Recommended This</p>
                      <div className="space-y-1">
                        <p className="text-[10px] text-charcoal-600 dark:text-rosegold-200 flex items-center gap-1">
                          <span className="text-emerald-500 font-bold">✓</span> Matches {salon.locality} location
                        </p>
                        <p className="text-[10px] text-charcoal-600 dark:text-rosegold-200 flex items-center gap-1">
                          <span className="text-emerald-500 font-bold">✓</span> Fits your budget preferences
                        </p>
                        <p className="text-[10px] text-charcoal-600 dark:text-rosegold-200 flex items-center gap-1">
                          <span className="text-emerald-500 font-bold">✓</span> Tailored to warm olive skin tone
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-rosegold-200/30">
                    <span className="text-xs text-charcoal-550 font-mono">From ₹{startingPrice}</span>
                    <Link
                      href={`/salons/${salon.id}`}
                      className="text-xs font-semibold text-rosegold-500 hover:text-rosegold-650 flex items-center gap-0.5 cursor-pointer"
                    >
                      Book Salon
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Collapsible Recent Activity & Beauty Journey */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-rosegold-200/40 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-400">My Beauty Journey & Insights</h3>
            {activeJourney && (
              <button
                onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
                className="text-xs font-semibold text-rosegold-500 hover:text-rosegold-655 flex items-center gap-1 cursor-pointer"
              >
                {isTimelineExpanded ? (
                  <>
                    <span>Show Less</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>View More / Expand</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {!activeJourney ? (
            /* Placeholder card if no active journey */
            <div className="p-8 rounded-2xl border border-dashed border-rosegold-355 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 text-center space-y-4 shadow-sm animate-fade-in">
              <Sparkles className="w-12 h-12 text-rosegold-500 mx-auto animate-pulse" />
              <h4 className="text-lg font-bold text-charcoal-900 dark:text-white">Begin a Customized Beauty Journey</h4>
              <p className="text-xs sm:text-sm text-charcoal-555 dark:text-rosegold-300 max-w-lg mx-auto leading-relaxed">
                Need to prepare for a wedding, party, vacation, or recover damaged skin and hair? Build a custom timeline with recommended services and dynamic progress tracking.
              </p>
              <div className="pt-2">
                <Link 
                  href="/advisor?tab=planner"
                  className="inline-flex items-center px-6 py-2.5 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic text-white text-xs font-bold transition-all shadow-md hover:scale-102 cursor-pointer"
                >
                  Create Beauty Journey Plan
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          ) : !isTimelineExpanded ? (
            /* Summary Row (Simple on the surface) */
            <div className="p-4 rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 flex justify-between items-center gap-4 text-xs text-charcoal-650 dark:text-rosegold-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rosegold-500 animate-pulse" />
                <span><strong>Active Journey:</strong> {activeJourney.journeyType} Plan ({activeJourney.progressPercent}% Completed)</span>
                {activePhase && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold bg-rosegold-500 text-white`}>
                    {activePhase.status}
                  </span>
                )}
              </div>
              <span className="font-mono text-charcoal-400">Target: {activeJourney.targetDate}</span>
            </div>
          ) : (
            /* Detailed view (Detailed when needed) */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Interactive Timeline */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-1 pb-2 border-b border-rosegold-200/30">
                  <h4 className="font-bold text-charcoal-950 dark:text-white flex items-center text-base font-playfair uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 text-rosegold-500 mr-2" />
                    Beauty Journey Timeline
                  </h4>
                  <p className="text-[11px] text-charcoal-400">Track and schedule treatments mapped directly to your beauty cycles. Update step status below to recalculate progress.</p>
                </div>
                
                <div className="space-y-4">
                  {activeJourney.steps.map((step) => {
                    const isStepCompleted = step.status === 'Completed';
                    const isStepInProgress = step.status === 'In Progress';
                    const isStepPending = step.status === 'Pending';
                    
                    return (
                      <div 
                        key={step.stepNumber} 
                        className={`p-4.5 rounded-2xl border relative transition-all text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                          isStepCompleted ? 'border-emerald-250 bg-emerald-50/5 dark:bg-emerald-950/10' :
                          isStepInProgress ? 'border-rosegold-300 bg-white dark:bg-charcoal-900' :
                          'border-rosegold-200/60 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-2xs'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] text-rosegold-550 dark:text-rosegold-350 uppercase tracking-widest font-bold bg-rosegold-100/30 dark:bg-charcoal-800 px-1.5 py-0.5 rounded-md">
                              {step.timeline}
                            </span>
                            <span className="text-[10px] text-charcoal-400 font-mono">Step {step.stepNumber}</span>
                          </div>
                          <h5 className="font-bold text-charcoal-900 dark:text-white">{step.title}</h5>
                          <p className="text-[11px] text-charcoal-555 dark:text-rosegold-300 font-light">{step.description}</p>
                          <div className="text-[10px] text-charcoal-450 dark:text-rosegold-400 pt-1">
                            Service: <strong className="text-charcoal-700 dark:text-white">{step.recommendedService}</strong>
                          </div>
                        </div>

                        {/* Status Toggle Buttons */}
                        <div className="flex items-center gap-1.5 bg-charcoal-50 dark:bg-charcoal-950/80 p-1 rounded-lg border border-rosegold-200/50 dark:border-charcoal-800 self-stretch sm:self-auto justify-around">
                          <button
                            onClick={() => updateJourneyStepStatus(step.stepNumber, 'Pending')}
                            className={`px-2 py-1 rounded-md text-[9px] font-bold cursor-pointer transition-colors ${
                              isStepPending ? 'bg-charcoal-200 dark:bg-charcoal-800 text-charcoal-900 dark:text-white' : 'text-charcoal-400 hover:text-charcoal-600'
                            }`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => updateJourneyStepStatus(step.stepNumber, 'In Progress')}
                            className={`px-2 py-1 rounded-md text-[9px] font-bold cursor-pointer transition-colors ${
                              isStepInProgress ? 'bg-rosegold-500 text-white shadow-2xs' : 'text-charcoal-400 hover:text-charcoal-600'
                            }`}
                          >
                            Active
                          </button>
                          <button
                            onClick={() => updateJourneyStepStatus(step.stepNumber, 'Completed')}
                            className={`px-2 py-1 rounded-md text-[9px] font-bold cursor-pointer transition-colors ${
                              isStepCompleted ? 'bg-emerald-600 text-white shadow-2xs' : 'text-charcoal-400 hover:text-charcoal-600'
                            }`}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar: Stats Card & Insights */}
              <div className="space-y-6">
                {/* Stats Card */}
                <div className="p-6 rounded-2xl border border-rosegold-350 dark:border-charcoal-800 bg-linear-to-b from-rosegold-100/25 to-white dark:from-charcoal-900 dark:to-charcoal-950/60 shadow-sm space-y-4 animate-fade-in">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-rosegold-500 uppercase tracking-widest bg-rosegold-100/40 dark:bg-charcoal-800 px-2 py-0.5 rounded-md">
                        ROADMAP OVERVIEW
                      </span>
                      <h4 className="font-bold text-charcoal-900 dark:text-white mt-1.5 font-playfair text-lg">
                        {activeJourney.journeyType} Journey
                      </h4>
                    </div>
                    
                    <button
                      onClick={deleteActiveJourney}
                      className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  <p className="text-[11px] text-charcoal-500 leading-normal font-light">
                    Goal: &ldquo;{activeJourney.goal}&rdquo;
                  </p>

                  {/* Progress Stats */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-charcoal-600 dark:text-rosegold-200">Glow Progress</span>
                      <span className="text-rosegold-550">{activeJourney.progressPercent}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-rosegold-100/40 dark:bg-charcoal-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-rosegold-500 to-gold-metallic h-full rounded-full transition-all duration-300"
                        style={{ width: `${activeJourney.progressPercent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] text-charcoal-400 font-mono">
                      <span>{completedStepsCount} / {totalStepsCount} Steps</span>
                      <span>Target: {activeJourney.targetDate}</span>
                    </div>
                  </div>

                  {/* Upcoming/Next step */}
                  {upcomingStep && (
                    <div className="p-3 bg-white dark:bg-charcoal-950 border border-rosegold-200 dark:border-charcoal-900 rounded-xl space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-charcoal-400">UPCOMING TASK</span>
                      <h5 className="text-xs font-bold text-charcoal-900 dark:text-white line-clamp-1">{upcomingStep.title}</h5>
                      <p className="text-[10px] text-charcoal-500 dark:text-rosegold-350 line-clamp-2 leading-relaxed">{upcomingStep.description}</p>
                      <div className="flex justify-between items-center text-[9px] pt-1">
                        <span className="text-rosegold-500 font-bold">{upcomingStep.recommendedService}</span>
                        <Link 
                          href={`/advisor?tab=planner`}
                          className="text-charcoal-450 hover:text-rosegold-500 font-bold flex items-center gap-0.5"
                        >
                          Find Salons <ArrowRight className="w-2 h-2" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Concierge Insights */}
                <div className="p-6 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 space-y-4 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-rosegold-600 dark:text-gold-medium border-b border-rosegold-200/40 pb-2">
                      <Sparkles className="w-4 h-4" />
                      <h4 className="font-bold tracking-wide text-xs uppercase">Insights</h4>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {proactiveInsights.slice(0, isInsightsExpanded ? 5 : 2).map((insight) => (
                        <div 
                          key={insight.id}
                          className={`p-2.5 rounded-xl border text-[11px] space-y-1.5 leading-normal ${
                            insight.severity === 'high' ? 'bg-red-500/5 border-red-200/50 text-red-955 dark:text-red-300' :
                            insight.severity === 'price' ? 'bg-emerald-500/5 border-emerald-200/50 text-emerald-955 dark:text-emerald-355' :
                            'bg-white/60 dark:bg-charcoal-950/40 border-rosegold-200/50 dark:border-charcoal-900 text-charcoal-700 dark:text-rosegold-200'
                          }`}
                        >
                          <div className="flex justify-between items-center font-bold">
                            <span className="uppercase tracking-wider text-[8px]">{insight.type}</span>
                            <Info className="w-3.5 h-3.5 text-rosegold-550" />
                          </div>
                          <p className="font-light">{insight.text}</p>
                          <div className="text-right">
                            <Link 
                              href={insight.link} 
                              className="text-[9px] font-bold text-rosegold-500 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              {insight.actionLabel}
                              <ArrowRight className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                    {proactiveInsights.length > 2 && (
                      <button
                        onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
                        className="text-[10px] font-bold text-rosegold-500 hover:text-rosegold-650 mt-1 cursor-pointer"
                      >
                        {isInsightsExpanded ? "Show fewer insights" : `Show all ${proactiveInsights.length} insights`}
                      </button>
                    )}
                  </div>
                  <div className="pt-2 border-t border-rosegold-100 dark:border-charcoal-800 text-center">
                    <span className="text-[9px] text-charcoal-400">Memory Engine: 5 parameters checked</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
