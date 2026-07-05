'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const { salons, bookings } = useApp();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'salons' | 'bookings'>('overview');

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="bg-white p-8 rounded-xl border border-border text-center shadow-sm max-w-sm w-full">
          <h1 className="text-2xl font-serif text-darktext mb-2">Access Denied</h1>
          <p className="text-mutedtext mb-6">You need administrator privileges to view this area.</p>
          <Link href="/" className="px-6 py-2 bg-plum text-warmwhite rounded-md font-medium hover:bg-plum-dark transition-colors inline-block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Real Metrics
  const totalSalons = salons.length;
  const totalServices = salons.reduce((acc, salon) => acc + salon.services.length, 0);
  const upcomingBookings = bookings.filter(b => new Date(`${b.date}T${b.time}`) >= new Date()).length;

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-plum text-warmwhite flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-plum-dark">
          <Link href="/" className="font-serif text-2xl font-bold tracking-wide">Aura Admin</Link>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'salons', label: 'Salons', icon: '🏪' },
            { id: 'bookings', label: 'Bookings', icon: '📅' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-left ${
                activeTab === tab.id 
                  ? 'bg-plum-dark text-white' 
                  : 'text-white/70 hover:bg-plum-dark/50 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-plum-dark">
          <Link href="/" className="text-xs text-white/70 hover:text-white flex items-center gap-2">
            <span>←</span> Back to App
          </Link>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-lg font-medium text-darktext capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-8 pr-4 py-1.5 bg-cream border border-border rounded-md text-sm text-darktext focus:outline-none focus:border-plum w-64"
              />
              <span className="absolute left-2.5 top-2 text-xs text-mutedtext">🔍</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-peach flex items-center justify-center text-white font-medium text-sm">
              A
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6 lg:p-8 bg-cream">
          
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
                  <p className="text-sm font-medium text-mutedtext uppercase tracking-wider mb-2">Total Salons</p>
                  <p className="text-4xl font-serif text-darktext">{totalSalons}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
                  <p className="text-sm font-medium text-mutedtext uppercase tracking-wider mb-2">Total Services</p>
                  <p className="text-4xl font-serif text-darktext">{totalServices}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
                  <p className="text-sm font-medium text-mutedtext uppercase tracking-wider mb-2">Upcoming Bookings</p>
                  <p className="text-4xl font-serif text-darktext">{upcomingBookings}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
                <h3 className="text-lg font-medium text-darktext mb-4">Quick Actions</h3>
                <div className="flex gap-4">
                  <button className="px-4 py-2 border border-border rounded-md text-sm font-medium text-darktext hover:bg-cream transition-colors">
                    + Add New Salon
                  </button>
                  <button className="px-4 py-2 border border-border rounded-md text-sm font-medium text-darktext hover:bg-cream transition-colors">
                    Export Data (CSV)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'salons' && (
            <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden animate-in fade-in">
              <div className="p-4 border-b border-border flex justify-between items-center bg-warmwhite">
                <h3 className="font-medium text-darktext">Salon Directory</h3>
                <button className="text-sm bg-plum text-warmwhite px-3 py-1.5 rounded hover:bg-plum-dark transition-colors">
                  Add Salon
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-cream text-mutedtext uppercase tracking-wider text-xs border-b border-border">
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Location</th>
                      <th className="p-4 font-medium">Services</th>
                      <th className="p-4 font-medium">Rating</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {salons.map(salon => (
                      <tr key={salon.id} className="hover:bg-cream/30 transition-colors">
                        <td className="p-4 font-medium text-darktext">{salon.name}</td>
                        <td className="p-4 text-mutedtext">{salon.location}</td>
                        <td className="p-4 text-mutedtext">{salon.services.length}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 bg-sage/10 text-sage px-2 py-0.5 rounded text-xs border border-sage/20">
                            ★ {salon.rating}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-plum hover:underline font-medium text-xs">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden animate-in fade-in">
              <div className="p-4 border-b border-border flex justify-between items-center bg-warmwhite">
                <h3 className="font-medium text-darktext">All Bookings</h3>
                <div className="flex gap-2">
                  <select className="text-xs border border-border rounded px-2 py-1 bg-white focus:outline-none focus:border-plum">
                    <option>All Status</option>
                    <option>Confirmed</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-cream text-mutedtext uppercase tracking-wider text-xs border-b border-border">
                      <th className="p-4 font-medium">Booking ID</th>
                      <th className="p-4 font-medium">User</th>
                      <th className="p-4 font-medium">Salon</th>
                      <th className="p-4 font-medium">Date & Time</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.length > 0 ? bookings.map((booking, i) => (
                      <tr key={booking.id} className="hover:bg-cream/30 transition-colors">
                        <td className="p-4 font-mono text-xs text-mutedtext">{booking.id}</td>
                        <td className="p-4 font-medium text-darktext">{booking.userName || booking.userEmail}</td>
                        <td className="p-4 text-darktext">{booking.salonName}</td>
                        <td className="p-4 text-mutedtext">{booking.date} @ {booking.time}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 bg-sage/10 text-sage px-2 py-0.5 rounded text-xs border border-sage/20">
                            Confirmed
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-mutedtext">No bookings found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {bookings.length > 0 && (
                <div className="p-4 border-t border-border bg-warmwhite flex justify-between items-center text-xs text-mutedtext">
                  <span>Showing 1 to {bookings.length} of {bookings.length} entries</span>
                  <div className="flex gap-1">
                    <button className="px-2 py-1 border border-border rounded bg-white text-border-dark cursor-not-allowed">Prev</button>
                    <button className="px-2 py-1 border border-plum bg-plum text-white rounded">1</button>
                    <button className="px-2 py-1 border border-border rounded bg-white text-border-dark cursor-not-allowed">Next</button>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
