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
  TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { bookings, salons, userProfile, activeJourney } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'saved' | 'journey'>('overview');

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
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach' 
                : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </button>

          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'bookings' 
                ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach' 
                : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            My Bookings
          </button>

          <button 
            onClick={() => setActiveTab('saved')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'saved' 
                ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach' 
                : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            Saved Salons
          </button>

          <button 
            onClick={() => setActiveTab('journey')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'journey' 
                ? 'bg-cream/15 text-white shadow-xs border-l-4 border-peach' 
                : 'text-warmwhite/75 hover:bg-cream/5 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            Beauty Journey
          </button>
        </nav>

        {/* Sidebar Footer Operations */}
        <div className="p-4 border-t border-plum-dark/50 space-y-1.5 flex-shrink-0">
          <Link 
            href="/advisor"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-warmwhite/75 hover:text-white transition-colors rounded-lg hover:bg-cream/5 text-left"
          >
            <ExternalLink className="w-4 h-4 text-peach" />
            Ask Aura Advisor
          </Link>
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
            <div className="w-10 h-10 rounded-full bg-plum text-warmwhite flex items-center justify-center font-bold text-sm shadow-md border-2 border-peach">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Content Workspace */}
        <main className="flex-grow overflow-y-auto p-8 bg-cream/40">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in">
              
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
                              <span className="text-[9px] font-semibold text-sage">Visited</span>
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
                          <Link 
                            href={`/salons/${booking.salonId}`}
                            className="inline-flex items-center gap-1 text-plum hover:text-plum-dark font-bold text-xs border border-plum/10 px-2.5 py-1 rounded-lg bg-plum/5 hover:bg-plum/10 transition-colors"
                          >
                            View Salon
                          </Link>
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
              <div className="bg-white p-6 rounded-2xl border border-border shadow-xs bg-cream/10">
                <h3 className="font-serif font-bold text-darktext text-lg">My Beauty Journeys & Timelines</h3>
                <p className="text-xs text-mutedtext mt-1">Monitor customized skincare prep, bridal glow planning, and AI recommendation timelines.</p>
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
                                className="text-[10px] font-bold text-plum hover:text-plum-dark"
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
                <div className="bg-white border border-dashed border-border rounded-2xl p-12 text-center bg-cream/5">
                  <p className="text-sm text-mutedtext mb-4">No active beauty preparations generated yet.</p>
                  <button 
                    onClick={() => router.push('/journey')}
                    className="px-6 py-2.5 bg-plum text-warmwhite text-xs font-bold rounded-xl hover:bg-plum-dark transition-colors cursor-pointer"
                  >
                    Generate Custom Beauty Plan
                  </button>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
