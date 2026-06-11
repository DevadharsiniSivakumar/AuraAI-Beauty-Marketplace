'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Users, 
  MapPin, 
  Calendar, 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Scissors, 
  PlusCircle,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export default function AdminDashboard() {
  const { salons, bookings, reviews, cancelBooking } = useApp();
  const [activeTab, setActiveTab] = useState<'bookings' | 'salons' | 'services' | 'reviews'>('bookings');

  // Moderate / Flag state simulation
  const [flaggedReviews, setFlaggedReviews] = useState<string[]>([]);
  const toggleFlagReview = (id: string) => {
    setFlaggedReviews(prev => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  // Compile calculations
  const totalUsersCount = 1428;
  const activeSalonsCount = salons.length;
  const bookingsCount = bookings.length + 234;
  const reviewsCount = reviews.length;
  
  // Calculate average rating
  const avgRating = parseFloat(
    (salons.reduce((acc, s) => acc + s.rating, 0) / salons.length).toFixed(1)
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-charcoal-900 dark:bg-rosegold-500/10 text-rosegold-500 flex items-center justify-center border border-rosegold-200 dark:border-charcoal-800 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-charcoal-950 dark:text-white">Admin Console</h1>
            <p className="text-sm text-charcoal-550 dark:text-rosegold-200">Corporate portal to oversee users, bookings, partner salons, and review moderation logs.</p>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-2 shadow-2xs">
            <div className="flex justify-between items-center text-charcoal-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Active Users</span>
              <Users className="w-5 h-5 text-rosegold-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-charcoal-950 dark:text-white">{totalUsersCount}</span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +12%
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-2 shadow-2xs">
            <div className="flex justify-between items-center text-charcoal-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Partner Salons</span>
              <MapPin className="w-5 h-5 text-rosegold-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-charcoal-950 dark:text-white">{activeSalonsCount}</span>
              <span className="text-xs font-light text-charcoal-450">Bangalore</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-2 shadow-2xs">
            <div className="flex justify-between items-center text-charcoal-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
              <Calendar className="w-5 h-5 text-rosegold-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-charcoal-950 dark:text-white">{bookingsCount}</span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +8%
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-2 shadow-2xs">
            <div className="flex justify-between items-center text-charcoal-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Rating</span>
              <Star className="w-5 h-5 text-rosegold-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-charcoal-950 dark:text-white">{avgRating}★</span>
              <span className="text-xs font-light text-charcoal-450">({reviewsCount} logs)</span>
            </div>
          </div>

        </section>

        {/* Dynamic Navigation & Tables Grid */}
        <section className="bg-white dark:bg-charcoal-900 rounded-3xl border border-rosegold-200 dark:border-charcoal-850 shadow-md overflow-hidden">
          
          {/* Tab Header Selector */}
          <div className="flex border-b border-rosegold-150 dark:border-charcoal-800 bg-linear-to-r from-rosegold-100/10 to-white dark:from-charcoal-905 overflow-x-auto">
            {(['bookings', 'salons', 'services', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 text-center transition-colors shrink-0 ${
                  activeTab === tab 
                    ? 'border-rosegold-500 text-rosegold-600 dark:text-gold-medium' 
                    : 'border-transparent text-charcoal-500 dark:text-rosegold-300 hover:text-rosegold-550'
                }`}
              >
                {tab} Management
              </button>
            ))}
          </div>

          {/* Tables body content */}
          <div className="p-6 overflow-x-auto">
            
            {/* BOOKINGS TABLE */}
            {activeTab === 'bookings' && (
              <div className="min-w-max w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-rosegold-100 dark:border-charcoal-800 text-charcoal-400 uppercase tracking-widest font-semibold">
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Salon Outlet</th>
                      <th className="py-3 px-4">Service booked</th>
                      <th className="py-3 px-4">Scheduled Date</th>
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Cost</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rosegold-100/50 dark:divide-charcoal-800/50 font-light text-charcoal-700 dark:text-rosegold-100">
                    {/* Live active bookings rendering */}
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-rosegold-50/20 dark:hover:bg-charcoal-950/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-rosegold-500">{b.id.substring(0, 12)}</td>
                        <td className="py-3 px-4 font-semibold text-charcoal-900 dark:text-white">Rhea Sen</td>
                        <td className="py-3 px-4">{b.salonName}</td>
                        <td className="py-3 px-4">{b.serviceName}</td>
                        <td className="py-3 px-4">{b.date}</td>
                        <td className="py-3 px-4">{b.time}</td>
                        <td className="py-3 px-4 font-semibold">₹{b.price}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${
                            b.status === 'Confirmed' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-350' : 
                            b.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-350' :
                            'bg-charcoal-100 text-charcoal-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {b.status === 'Confirmed' ? (
                            <button
                              onClick={() => cancelBooking(b.id)}
                              className="text-xs px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-950/50 text-red-650 dark:text-red-350 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                            >
                              Cancel Booking
                            </button>
                          ) : (
                            <span className="text-charcoal-400 font-light">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Static historical bookings to fill out table */}
                    <tr className="hover:bg-rosegold-50/20 dark:hover:bg-charcoal-950/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-rosegold-500">booking-hist-0</td>
                      <td className="py-3 px-4 font-semibold text-charcoal-900 dark:text-white">Ananya Sen</td>
                      <td className="py-3 px-4">Play Salon UB City</td>
                      <td className="py-3 px-4">Precision French Haircut</td>
                      <td className="py-3 px-4">2026-06-08</td>
                      <td className="py-3 px-4">1:30 PM</td>
                      <td className="py-3 px-4 font-semibold">₹3000</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-charcoal-100/50 dark:bg-charcoal-800 text-charcoal-600 dark:text-rosegold-200">
                          Completed
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-charcoal-400 font-light">Completed</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* SALONS TABLE */}
            {activeTab === 'salons' && (
              <div className="min-w-max w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-rosegold-100 dark:border-charcoal-800 text-charcoal-400 uppercase tracking-widest font-semibold">
                      <th className="py-3 px-4">Salon Name</th>
                      <th className="py-3 px-4">Locality</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Avg Rating</th>
                      <th className="py-3 px-4">Reviews Count</th>
                      <th className="py-3 px-4">Brand Segment</th>
                      <th className="py-3 px-4">Home Service</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rosegold-100/50 dark:divide-charcoal-800/50 font-light text-charcoal-700 dark:text-rosegold-100">
                    {salons.map((s) => (
                      <tr key={s.id} className="hover:bg-rosegold-50/20 dark:hover:bg-charcoal-950/20 transition-colors">
                        <td className="py-3 px-4 font-semibold text-charcoal-900 dark:text-white">{s.name}</td>
                        <td className="py-3 px-4">{s.locality}</td>
                        <td className="py-3 px-4 font-mono">{s.phone}</td>
                        <td className="py-3 px-4 text-rosegold-500 font-bold">{s.rating} ★</td>
                        <td className="py-3 px-4">{s.reviewsCount} logs</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${
                            s.isLuxury ? 'bg-linear-to-r from-rosegold-500 to-gold-metallic text-white' : 'bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-rosegold-200'
                          }`}>
                            {s.isLuxury ? 'Luxury' : 'Standard'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-charcoal-600 dark:text-rosegold-100">
                          {s.offersHomeService ? 'Available' : 'In-Store Only'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-350 font-semibold">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SERVICES TABLE */}
            {activeTab === 'services' && (
              <div className="min-w-max w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-rosegold-100 dark:border-charcoal-800 text-charcoal-400 uppercase tracking-widest font-semibold">
                      <th className="py-3 px-4">Service Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Standard Rate</th>
                      <th className="py-3 px-4">Partner Outlets</th>
                      <th className="py-3 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rosegold-100/50 dark:divide-charcoal-800/50 font-light text-charcoal-700 dark:text-rosegold-100">
                    {salons.flatMap(s => s.services.map(ser => ({ ...ser, salonName: s.name }))).slice(0, 10).map((ser, idx) => (
                      <tr key={idx} className="hover:bg-rosegold-50/20 dark:hover:bg-charcoal-950/20 transition-colors">
                        <td className="py-3 px-4 font-semibold text-charcoal-900 dark:text-white">{ser.name}</td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-rosegold-500">{ser.category}</span>
                        </td>
                        <td className="py-3 px-4">{ser.duration}</td>
                        <td className="py-3 px-4 font-bold">₹{ser.price}</td>
                        <td className="py-3 px-4 text-charcoal-500">{ser.salonName}</td>
                        <td className="py-3 px-4 max-w-sm truncate text-charcoal-450 dark:text-rosegold-300 font-light">{ser.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* REVIEWS MODERATION TABLE */}
            {activeTab === 'reviews' && (
              <div className="min-w-max w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-rosegold-100 dark:border-charcoal-800 text-charcoal-400 uppercase tracking-widest font-semibold">
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Salon Outlet</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 max-w-md">Comment</th>
                      <th className="py-3 px-4">Flags</th>
                      <th className="py-3 px-4 text-center">Moderation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rosegold-100/50 dark:divide-charcoal-800/50 font-light text-charcoal-700 dark:text-rosegold-100">
                    {reviews.map((rev: any, idx: number) => {
                      const isFlagged = flaggedReviews.includes(rev.id);
                      return (
                        <tr key={rev.id || idx} className="hover:bg-rosegold-50/20 dark:hover:bg-charcoal-950/20 transition-colors">
                          <td className="py-3 px-4 font-semibold text-charcoal-900 dark:text-white">{rev.author}</td>
                          <td className="py-3 px-4 text-charcoal-550">{rev.salonName}</td>
                          <td className="py-3 px-4 text-rosegold-500 font-bold">{rev.rating} ★</td>
                          <td className="py-3 px-4 font-mono">{rev.date}</td>
                          <td className="py-3 px-4 max-w-xs truncate italic">&ldquo;{rev.comment}&rdquo;</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${
                              isFlagged ? 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-350' : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-350'
                            }`}>
                              {isFlagged ? 'Flagged / Moderated' : 'Verified'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => toggleFlagReview(rev.id)}
                              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                isFlagged 
                                  ? 'border-emerald-250 text-emerald-650 hover:bg-emerald-50' 
                                  : 'border-red-200 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20'
                              }`}
                            >
                              {isFlagged ? 'Approve & Restore' : 'Flag / Hide Comment'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
