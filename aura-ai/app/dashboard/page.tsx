'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { bookings, salons, userProfile } = useApp();
  const favorites = userProfile?.favoriteSalons || [];

  const userBookings = bookings.filter(b => b.userId === user?.uid);
  const upcomingBookings = userBookings.filter(b => new Date(`${b.date}T${b.time}`) >= new Date()).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  const pastBookings = userBookings.filter(b => new Date(`${b.date}T${b.time}`) < new Date()).sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  const savedSalons = salons.filter(s => favorites.includes(s.id));
  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-darktext mb-2">Good morning, {userName}</h1>
          <p className="text-mutedtext">Welcome back to your personal beauty dashboard.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Upcoming Booking (Large Horizontal) */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-medium text-darktext">Upcoming Appointment</h2>
              </div>
              
              {upcomingBookings.length > 0 ? (
                <div className="bg-white border border-border rounded-xl shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-plum"></div>
                  
                  <div className="flex-shrink-0 bg-cream p-4 rounded-lg text-center border border-border min-w-[100px]">
                    <span className="block text-sm text-plum font-medium uppercase tracking-wider">{new Date(upcomingBookings[0].date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="block font-serif text-3xl text-darktext">{new Date(upcomingBookings[0].date).getDate()}</span>
                    <span className="block text-xs text-mutedtext mt-1">{upcomingBookings[0].time}</span>
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium text-xl text-darktext">{upcomingBookings[0].salonName}</h3>
                    <p className="text-mutedtext mt-1">{upcomingBookings[0].serviceName}</p>
                    <div className="flex gap-4 mt-4">
                      <Link href={`/salons/${upcomingBookings[0].salonId}`} className="text-sm font-medium text-plum hover:underline">
                        View Salon
                      </Link>
                      <button className="text-sm font-medium text-mutedtext hover:text-darktext">
                        Reschedule
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <span className="inline-block px-3 py-1 bg-sage/10 text-sage text-xs font-medium rounded-full border border-sage/20">
                      Confirmed
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-dashed border-border rounded-xl p-8 text-center text-mutedtext">
                  <p className="mb-4">You don't have any upcoming appointments.</p>
                  <Link href="/salons" className="px-6 py-2 bg-plum text-warmwhite rounded-md font-medium hover:bg-plum-dark transition-colors inline-block text-sm">
                    Find a Salon
                  </Link>
                </div>
              )}
            </section>

            {/* Beauty Journey Timeline */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-medium text-darktext">Active Journey</h2>
                <Link href="/journey" className="text-sm text-plum hover:underline">Planner</Link>
              </div>
              <div className="bg-white border border-border rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-medium text-darktext">Wedding Prep Timeline</h3>
                    <p className="text-sm text-mutedtext">3 weeks remaining</p>
                  </div>
                  <span className="text-xs font-medium bg-cream px-2 py-1 rounded text-darktext border border-border">40% Complete</span>
                </div>
                
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-cream -translate-y-1/2 rounded"></div>
                  <div className="absolute top-1/2 left-0 w-[40%] h-1 bg-plum -translate-y-1/2 rounded"></div>
                  
                  <div className="relative flex justify-between">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-plum ring-4 ring-white z-10"></div>
                      <span className="text-[10px] text-mutedtext font-medium uppercase">Wk 1</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-plum ring-4 ring-white z-10"></div>
                      <span className="text-[10px] text-mutedtext font-medium uppercase">Wk 2</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-plum bg-white ring-4 ring-white z-10"></div>
                      <span className="text-[10px] text-plum font-bold uppercase">Wk 3</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-cream border border-border ring-4 ring-white z-10"></div>
                      <span className="text-[10px] text-mutedtext font-medium uppercase">Event</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Recommendations */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-medium text-darktext">Aura's Recommendations</h2>
                <Link href="/advisor" className="text-sm text-plum hover:underline">Ask Aura</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {salons.slice(0, 2).map(salon => (
                  <div key={salon.id} className="bg-white border border-border rounded-xl p-4 flex gap-4 items-center group shadow-sm hover:border-plum transition-colors">
                    <div className="w-16 h-16 bg-sage/20 rounded-lg overflow-hidden flex-shrink-0 border border-border"></div>
                    <div>
                      <h3 className="font-medium text-darktext text-sm group-hover:text-plum transition-colors">{salon.name}</h3>
                      <p className="text-xs text-mutedtext mt-1">{salon.location}</p>
                      <Link href={`/salons/${salon.id}`} className="text-xs font-medium text-plum mt-2 inline-block hover:underline">View details &rarr;</Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column (1/3 width on desktop) */}
          <div className="space-y-8">
            
            {/* Saved Salons */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-medium text-darktext">Saved Salons</h2>
                <Link href="/profile" className="text-sm text-plum hover:underline">Manage</Link>
              </div>
              <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                {savedSalons.length > 0 ? (
                  <div className="divide-y divide-border">
                    {savedSalons.slice(0, 4).map(salon => (
                      <Link key={salon.id} href={`/salons/${salon.id}`} className="flex items-center gap-4 p-4 hover:bg-cream/50 transition-colors">
                        <div className="w-12 h-12 bg-coral/20 rounded border border-border flex-shrink-0"></div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-sm text-darktext">{salon.name}</h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-gold text-[10px]">★</span>
                            <span className="text-xs text-mutedtext">{salon.rating}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-mutedtext">
                    You haven't saved any salons yet.
                  </div>
                )}
                {savedSalons.length > 4 && (
                  <div className="p-3 bg-cream border-t border-border text-center">
                    <Link href="/profile" className="text-xs font-medium text-plum hover:underline">View all {savedSalons.length} saved</Link>
                  </div>
                )}
              </div>
            </section>

            {/* Past Bookings Summary */}
            <section>
              <h2 className="text-lg font-medium text-darktext mb-4">Past Visits</h2>
              <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden divide-y divide-border">
                {pastBookings.length > 0 ? (
                  pastBookings.slice(0, 3).map(booking => (
                    <div key={booking.id} className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm text-darktext">{booking.salonName}</h4>
                        <span className="text-xs text-mutedtext">{new Date(booking.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-mutedtext">{booking.serviceName}</p>
                      <button className="text-xs font-medium text-plum mt-2 hover:underline">Book again</button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-mutedtext">
                    No past visits recorded.
                  </div>
                )}
              </div>
            </section>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
