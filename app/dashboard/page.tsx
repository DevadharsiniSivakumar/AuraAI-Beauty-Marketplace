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
  const { userProfile, bookings, salons, cancelBooking } = useApp();

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

  // Visual Beauty Journey Timeline items
  const timelinePhases = [
    { name: 'Skin Prep & Cleansing', status: 'Completed', date: 'May 28', desc: 'Hydra Facial & Brightening peel complete.' },
    { name: 'Scalp Detox Therapy', status: 'In Progress', date: 'Active Cycle', desc: 'Maintain moisture using organic essential oils.' },
    { name: 'Hair Color & Balayage', status: 'Scheduled', date: 'June 18', desc: 'Booking confirmed at Bodycraft Indiranagar.' },
    { name: 'Bridal Prep & Makeup', status: 'Recommended', date: 'Before Wedding', desc: 'Celebrity artist consultations at UB City.' }
  ];

  const activePhase = timelinePhases.find(p => p.status === 'In Progress') || timelinePhases[0];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Top Section: Welcome & Global Search */}
        <section className="relative rounded-3xl overflow-hidden border border-rosegold-200 dark:border-charcoal-800 bg-linear-to-b from-rosegold-100/30 to-white dark:from-charcoal-900 dark:to-charcoal-950 p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-950 dark:text-white font-playfair">
              Welcome back, {userProfile.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-charcoal-550 dark:text-rosegold-200">
              Your Beauty DNA profile is synchronized. Discover bespoke luxury treatments matching your skin and location.
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
                <p className="text-base font-bold text-charcoal-900 dark:text-white">AI Concierge</p>
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
        <section className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-4 shadow-xs">
          <h3 className="text-lg font-bold text-charcoal-950 dark:text-white flex items-center">
            <Calendar className="w-5 h-5 text-rosegold-500 mr-2" />
            Upcoming Bookings
          </h3>

          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingBookings.map((b) => (
                <div 
                  key={b.id}
                  className="p-4 rounded-xl border border-rosegold-100 dark:border-charcoal-800 bg-rosegold-50/10 dark:bg-charcoal-955/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-rosegold-300 transition-colors"
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
        <section className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-6 shadow-2xs">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-charcoal-950 dark:text-white flex items-center">
                <Sparkles className="w-5 h-5 text-rosegold-550 mr-2 animate-pulse" />
                Recommended Salons
              </h3>
              <p className="text-xs text-charcoal-550 dark:text-rosegold-200">High-matching selections generated dynamically based on your skin type (Warm Beige) and location.</p>
            </div>
            <Link 
              href="/salons"
              className="text-xs font-bold text-rosegold-500 hover:text-rosegold-650 flex items-center gap-0.5 hover:underline cursor-pointer"
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
                  className="rounded-xl border border-rosegold-200/50 dark:border-charcoal-850 bg-rosegold-50/10 dark:bg-charcoal-950/20 p-4 flex flex-col justify-between space-y-4 hover:border-rosegold-350 transition-colors shadow-2xs group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic text-white">
                        {salon.matchScore}% Match
                      </span>
                      <div className="flex text-rosegold-550 text-xs items-center font-bold">
                        <Star className="w-3.5 h-3.5 fill-rosegold-500 mr-0.5" />
                        {salon.rating}
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-charcoal-900 dark:text-white line-clamp-1">{salon.name}</h4>
                    <p className="text-xs text-charcoal-400">{salon.locality}</p>
                    
                    {/* Reasoning list preview */}
                    <div className="space-y-1.5 pt-1.5 border-t border-rosegold-200/40">
                      {salon.badges.slice(0, 2).map((badge, bIdx) => (
                        <p key={bIdx} className="text-[10px] text-charcoal-550 dark:text-rosegold-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                          {badge}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-rosegold-100 dark:border-charcoal-800">
                    <span className="text-xs text-charcoal-550">From ₹{startingPrice}</span>
                    <Link
                      href={`/salons/${salon.id}`}
                      className="text-xs font-semibold text-rosegold-500 hover:text-rosegold-650 flex items-center gap-0.5 cursor-pointer"
                    >
                      Book Agent
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-400">Recent Activity & Beauty Journey</h3>
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
          </div>

          {!isTimelineExpanded ? (
            /* Summary Row (Simple on the surface) */
            <div className="p-4 rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 flex justify-between items-center gap-4 text-xs text-charcoal-650 dark:text-rosegold-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rosegold-500" />
                <span><strong>Active Treatment Cycle:</strong> {activePhase.name}</span>
                <span className="bg-rosegold-500 text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">{activePhase.status}</span>
              </div>
              <span className="font-mono text-charcoal-400">{activePhase.date}</span>
            </div>
          ) : (
            /* Detailed view (Detailed when needed) */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Timeline */}
              <div className="lg:col-span-2 p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-4 shadow-2xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-charcoal-900 dark:text-white flex items-center text-sm uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 text-rosegold-500 mr-2" />
                    Personal Beauty Journey Timeline
                  </h4>
                  <p className="text-[11px] text-charcoal-400">Track and schedule treatments mapped directly to your beauty cycles.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {timelinePhases.map((phase, idx) => {
                    const isCompleted = phase.status === 'Completed';
                    const isInProgress = phase.status === 'In Progress';
                    const isScheduled = phase.status === 'Scheduled';
                    return (
                      <div 
                        key={idx} 
                        className={`p-3.5 rounded-xl border relative transition-all text-xs ${
                          isCompleted ? 'border-emerald-200/80 bg-emerald-50/10 dark:bg-emerald-950/10' :
                          isInProgress ? 'border-rosegold-400 bg-rosegold-50/10 dark:bg-charcoal-955/20' :
                          isScheduled ? 'border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900' :
                          'border-dashed border-rosegold-200 dark:border-charcoal-850 bg-rosegold-50/5'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isCompleted ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-355' :
                            isInProgress ? 'bg-rosegold-500 text-white' :
                            isScheduled ? 'bg-rosegold-100 dark:bg-charcoal-850 text-rosegold-600 dark:text-gold-medium' :
                            'bg-charcoal-100 text-charcoal-405'
                          }`}>
                            {phase.status}
                          </span>
                          <span className="text-[9px] text-charcoal-400 font-mono">{phase.date}</span>
                        </div>
                        <h5 className="font-bold text-charcoal-900 dark:text-white">{phase.name}</h5>
                        <p className="text-[11px] text-charcoal-555 dark:text-rosegold-300 font-light mt-1">{phase.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Concierge Insights */}
              <div className="p-6 rounded-2xl border border-rosegold-300 dark:border-charcoal-800 bg-linear-to-b from-rosegold-100/20 to-white dark:from-charcoal-900 dark:to-charcoal-950 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-rosegold-600 dark:text-gold-medium border-b border-rosegold-200/40 pb-2">
                    <Sparkles className="w-4 h-4" />
                    <h4 className="font-bold tracking-wide text-xs uppercase">Aura Concierge Insights</h4>
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
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
