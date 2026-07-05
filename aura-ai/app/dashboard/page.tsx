'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';

export default function UserDashboard() {
  const router = useRouter();
  const { userProfile, bookings, salons } = useApp();

  const upcomingBookings = bookings.filter(b => ['Pending', 'Confirmed', 'In Progress'].includes(b.status));

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAF8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column - Profile & Nav */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-[#FFFFFF] border border-[#E5DED8] p-6 rounded-md space-y-4">
              <div className="w-16 h-16 bg-[#2D2926] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">
                {userProfile.name[0]}
              </div>
              <div className="text-center">
                <h2 className="font-bold text-[#2D2926] text-lg">{userProfile.name}</h2>
                <p className="text-sm text-[#716A65]">{userProfile.email || 'user@example.com'}</p>
              </div>
              
              <div className="pt-4 border-t border-[#E5DED8] flex flex-col gap-2 text-sm">
                <Link href="/dashboard" className="font-medium text-[#2D2926] bg-[#FCFAF8] px-3 py-2 rounded">
                  Dashboard
                </Link>
                <Link href="/salons" className="font-medium text-[#716A65] hover:bg-[#FCFAF8] hover:text-[#2D2926] px-3 py-2 rounded transition-colors">
                  Explore Salons
                </Link>
                <Link href="/concierge" className="font-medium text-[#716A65] hover:bg-[#FCFAF8] hover:text-[#2D2926] px-3 py-2 rounded transition-colors">
                  Ask Aura
                </Link>
                <Link href="/advisor" className="font-medium text-[#716A65] hover:bg-[#FCFAF8] hover:text-[#2D2926] px-3 py-2 rounded transition-colors">
                  Style Advisor
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Column - Main Content */}
          <section className="flex-1 w-full space-y-8">
            
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-[#2D2926]">Your Dashboard</h1>
              <p className="text-sm text-[#716A65]">Manage your bookings and preferences.</p>
            </div>

            {/* Upcoming Bookings */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#2D2926]">Upcoming Bookings</h3>
              
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((b) => (
                    <div key={b.id} className="bg-[#FFFFFF] border border-[#E5DED8] p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#9D5965] bg-[#FCFAF8] border border-[#E5DED8] px-2 py-0.5 rounded">
                            {b.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-[#2D2926]">{b.serviceName}</h4>
                        <p className="text-sm text-[#716A65]">{b.salonName}</p>
                        <p className="text-xs text-[#716A65] mt-1 font-mono">
                          {b.date} · {b.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#2D2926] block mb-2">₹{b.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#FFFFFF] border border-[#E5DED8] p-8 text-center rounded-md">
                  <p className="text-sm text-[#716A65] mb-4">You have no upcoming bookings.</p>
                  <Link href="/salons" className="bg-[#2D2926] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#1a1715] transition-colors inline-block">
                    Find a Salon
                  </Link>
                </div>
              )}
            </div>

            {/* Recommended for you */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#2D2926]">Recommended for you</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {salons.slice(0, 3).map((salon) => (
                  <div key={salon.id} className="border border-[#E5DED8] rounded-md overflow-hidden bg-[#FCFAF8] flex flex-col">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={salon.image} alt={salon.name} className="w-full h-32 object-cover border-b border-[#E5DED8]" />
                    <div className="p-4 flex flex-col flex-1 gap-1">
                      <h4 className="font-bold text-[#2D2926] text-sm truncate">{salon.name}</h4>
                      <p className="text-xs text-[#716A65]">{salon.locality}</p>
                      <div className="mt-auto pt-3">
                        <Link href={`/salons/${salon.id}`} className="text-xs font-medium text-[#9D5965] hover:underline">
                          View salon
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
