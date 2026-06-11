'use client';

import React from 'react';
import Link from 'next/link';
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
  Info
} from 'lucide-react';

export default function UserDashboard() {
  const { userProfile, bookings, salons, cancelBooking } = useApp();

  const activeBookings = bookings.filter(b => b.status === 'Confirmed');
  const pastBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Welcome Banner */}
        <section className="relative rounded-3xl overflow-hidden border border-rosegold-200 dark:border-charcoal-800 bg-linear-to-r from-rosegold-100/40 via-gold-light/20 to-white dark:from-charcoal-900 dark:to-charcoal-950 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-rosegold-600 dark:text-gold-medium uppercase tracking-widest block">AI Beauty Concierge Agent</span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-950 dark:text-white">
              Hello, {userProfile.name}
            </h1>
            <p className="text-sm text-charcoal-550 dark:text-rosegold-200">
              Your beauty concierge remembers you. AuraAI has analyzed your bookings, reviews, and DNA parameters.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs px-3 py-1 rounded-full bg-white dark:bg-charcoal-800 border border-rosegold-200/50 dark:border-charcoal-700 text-charcoal-600 dark:text-rosegold-200 flex items-center">
                <MapPin className="w-3 h-3 text-rosegold-500 mr-1" />
                {userProfile.location}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-white dark:bg-charcoal-800 border border-rosegold-200/50 dark:border-charcoal-700 text-charcoal-600 dark:text-rosegold-200">
                Skin: {userProfile.skinTone} (Warm Undertone)
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-white dark:bg-charcoal-800 border border-rosegold-200/50 dark:border-charcoal-700 text-charcoal-600 dark:text-rosegold-200">
                Hair: {userProfile.hairType} (2C Wavy)
              </span>
            </div>
          </div>
          
          <Link
            href="/concierge"
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic text-white font-medium shadow-md hover:scale-102 transition-all shrink-0 animate-pulse"
          >
            <Sparkles className="w-4 h-4" />
            <span>Consult AI Concierge</span>
          </Link>
        </section>

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Link
            href="/concierge"
            className="p-4 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 text-center hover:scale-102 hover:border-rosegold-400 dark:hover:border-rosegold-800 transition-all space-y-2 group shadow-2xs"
          >
            <div className="mx-auto w-10 h-10 rounded-full bg-rosegold-500/10 text-rosegold-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-charcoal-900 dark:text-white">Talk to AuraAI</p>
          </Link>

          <Link
            href="/salons"
            className="p-4 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 text-center hover:scale-102 hover:border-rosegold-400 dark:hover:border-rosegold-800 transition-all space-y-2 group shadow-2xs"
          >
            <div className="mx-auto w-10 h-10 rounded-full bg-rosegold-500/10 text-rosegold-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-charcoal-900 dark:text-white">Explore Salons</p>
          </Link>

          <Link
            href="/advisor"
            className="p-4 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 text-center hover:scale-102 hover:border-rosegold-400 dark:hover:border-rosegold-800 transition-all space-y-2 group shadow-2xs col-span-2 sm:col-span-1"
          >
            <div className="mx-auto w-10 h-10 rounded-full bg-rosegold-500/10 text-rosegold-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-charcoal-900 dark:text-white">Style Advisor</p>
          </Link>

          <Link
            href="/reviews"
            className="p-4 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 text-center hover:scale-102 hover:border-rosegold-400 dark:hover:border-rosegold-800 transition-all space-y-2 group shadow-2xs"
          >
            <div className="mx-auto w-10 h-10 rounded-full bg-rosegold-500/10 text-rosegold-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-charcoal-900 dark:text-white">My Reviews</p>
          </Link>

          <Link
            href="/profile"
            className="p-4 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 text-center hover:scale-102 hover:border-rosegold-400 dark:hover:border-rosegold-800 transition-all space-y-2 group shadow-2xs"
          >
            <div className="mx-auto w-10 h-10 rounded-full bg-rosegold-500/10 text-rosegold-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-charcoal-900 dark:text-white">My Profile</p>
          </Link>
        </section>

        {/* Visual Beauty Journey Timeline */}
        <section className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-charcoal-950 dark:text-white flex items-center">
              <TrendingUp className="w-5 h-5 text-rosegold-500 mr-2" />
              Your Personal Beauty Journey Timeline
            </h3>
            <p className="text-xs text-charcoal-500">Track and schedule treatments mapped directly to your beauty cycles and milestones.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {timelinePhases.map((phase, idx) => {
              const isCompleted = phase.status === 'Completed';
              const isInProgress = phase.status === 'In Progress';
              const isScheduled = phase.status === 'Scheduled';
              
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border relative transition-all ${
                    isCompleted ? 'border-emerald-200/80 bg-emerald-50/10 dark:bg-emerald-950/10' :
                    isInProgress ? 'border-rosegold-400 bg-rosegold-50/10 dark:bg-charcoal-950/20' :
                    isScheduled ? 'border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900' :
                    'border-dashed border-rosegold-200 dark:border-charcoal-800/80 bg-rosegold-50/5 dark:bg-charcoal-950/5'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isCompleted ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-350' :
                      isInProgress ? 'bg-rosegold-500 text-white' :
                      isScheduled ? 'bg-rosegold-100 dark:bg-charcoal-850 text-rosegold-600 dark:text-gold-medium' :
                      'bg-charcoal-100 text-charcoal-400'
                    }`}>
                      {phase.status}
                    </span>
                    <span className="text-[10px] text-charcoal-400 font-mono">{phase.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-charcoal-900 dark:text-white">{phase.name}</h4>
                  <p className="text-xs text-charcoal-500 dark:text-rosegold-350 leading-relaxed font-light mt-1">{phase.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Dynamic AI Insights & Upcoming Appointments Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Expanded AI Insights Card (multiple proactive alerts) */}
          <div className="lg:col-span-1 p-6 rounded-2xl border border-rosegold-300 dark:border-charcoal-800 bg-linear-to-b from-rosegold-100/20 to-white dark:from-charcoal-900 dark:to-charcoal-950 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-rosegold-600 dark:text-gold-medium border-b border-rosegold-200/40 pb-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold tracking-wide text-sm uppercase">Aura Concierge Insights</h3>
              </div>

              {/* Insights List */}
              <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                {proactiveInsights.map((insight) => (
                  <div 
                    key={insight.id}
                    className={`p-3 rounded-xl border text-xs space-y-2 leading-relaxed ${
                      insight.severity === 'high' ? 'bg-red-500/5 border-red-200/50 text-red-950 dark:text-red-300' :
                      insight.severity === 'price' ? 'bg-emerald-500/5 border-emerald-200/50 text-emerald-950 dark:text-emerald-350' :
                      'bg-white/60 dark:bg-charcoal-950/40 border-rosegold-150 dark:border-charcoal-900 text-charcoal-700 dark:text-rosegold-200'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="uppercase tracking-wider text-[9px]">{insight.type}</span>
                      <Info className="w-3.5 h-3.5 text-rosegold-500" />
                    </div>
                    <p className="font-light">{insight.text}</p>
                    <div className="pt-1 text-right">
                      <Link 
                        href={insight.link} 
                        className="text-[10px] font-bold text-rosegold-500 hover:text-rosegold-650 inline-flex items-center gap-0.5"
                      >
                        {insight.actionLabel}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-3 border-t border-rosegold-100 dark:border-charcoal-800 text-center">
              <span className="text-[10px] text-charcoal-400">Memory Engine: 5 parameters checked</span>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-4 shadow-xs">
            <h3 className="text-lg font-bold text-charcoal-950 dark:text-white flex items-center">
              <Calendar className="w-5 h-5 text-rosegold-500 mr-2" />
              Upcoming Appointments
            </h3>

            {activeBookings.length > 0 ? (
              <div className="space-y-4">
                {activeBookings.map((b) => (
                  <div 
                    key={b.id}
                    className="p-4 rounded-xl border border-rosegold-100 dark:border-charcoal-800 bg-rosegold-50/10 dark:bg-charcoal-950/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-rosegold-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-350">
                          {b.status}
                        </span>
                        <span className="text-[10px] text-rosegold-500 font-mono">Matched by DNA Profile</span>
                      </div>
                      <h4 className="font-semibold text-charcoal-900 dark:text-white">{b.serviceName}</h4>
                      <p className="text-xs text-charcoal-500 dark:text-rosegold-300">{b.salonName}</p>
                      <div className="flex items-center space-x-4 text-xs text-charcoal-400 pt-1">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {b.date}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {b.time}
                        </span>
                        <span className="font-medium text-charcoal-700 dark:text-rosegold-100">
                          ₹{b.price}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => cancelBooking(b.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-950/50 text-red-650 dark:text-red-350 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Booking
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-rosegold-200 dark:border-charcoal-800 rounded-xl space-y-2">
                <Calendar className="w-8 h-8 text-charcoal-300 mx-auto" />
                <p className="text-sm font-medium text-charcoal-700 dark:text-rosegold-200">No active bookings found</p>
                <p className="text-xs text-charcoal-400">Discover salons and book via our explore tool</p>
                <div className="pt-2">
                  <Link 
                    href="/salons"
                    className="inline-flex items-center px-4 py-1.5 rounded-full bg-rosegold-500 text-white text-xs font-semibold"
                  >
                    Browse Salons
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* AI Recommendations For You Section */}
        <section className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-charcoal-950 dark:text-white flex items-center">
              <Sparkles className="w-5 h-5 text-rosegold-500 mr-2 animate-bounce" />
              AI Recommendations For You
            </h3>
            <p className="text-xs text-charcoal-550 dark:text-rosegold-200">High-matching selections generated dynamically based on your skin type (Warm Beige) and location.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {salons.slice(0, 3).map((salon) => {
              const startingPrice = Math.min(...salon.services.map(s => s.price));
              return (
                <div 
                  key={salon.id}
                  className="rounded-xl border border-rosegold-200/50 dark:border-charcoal-850 bg-rosegold-50/10 dark:bg-charcoal-950/20 p-4 flex flex-col justify-between space-y-4 hover:border-rosegold-350 transition-colors"
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

                    <h4 className="font-bold text-sm text-charcoal-900 dark:text-white">{salon.name}</h4>
                    <p className="text-xs text-charcoal-400">{salon.locality}</p>
                    
                    {/* Reasoning list preview */}
                    <div className="space-y-1 pt-1 border-t border-rosegold-200/40">
                      {salon.badges.slice(0, 2).map((badge, bIdx) => (
                        <p key={bIdx} className="text-[10px] text-charcoal-550 dark:text-rosegold-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                          {badge}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-rosegold-100 dark:border-charcoal-800">
                    <span className="text-xs text-charcoal-500">From ₹{startingPrice}</span>
                    <Link
                      href={`/salons/${salon.id}`}
                      className="text-xs font-semibold text-rosegold-500 hover:text-rosegold-650 flex items-center gap-0.5"
                    >
                      Book Agent
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
