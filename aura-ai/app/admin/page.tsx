'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';

interface AdminDashboardProps {
  defaultTab?: 'bookings' | 'salons';
}

export default function AdminDashboard({ defaultTab = 'bookings' }: AdminDashboardProps) {
  const { salons, bookings, deleteSalon, cancelBooking } = useApp();
  const [activeTab, setActiveTab] = useState<'bookings' | 'salons'>(defaultTab);

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAF8]">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <div className="border-b border-[#E5DED8] pb-6">
          <h1 className="text-2xl font-bold text-[#2D2926]">Admin Console</h1>
          <p className="text-sm text-[#716A65]">Manage bookings and salons.</p>
        </div>

        <div className="flex gap-4 border-b border-[#E5DED8]">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'bookings'
                ? 'border-[#9D5965] text-[#9D5965]'
                : 'border-transparent text-[#716A65] hover:text-[#2D2926]'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('salons')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'salons'
                ? 'border-[#9D5965] text-[#9D5965]'
                : 'border-transparent text-[#716A65] hover:text-[#2D2926]'
            }`}
          >
            Salons
          </button>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5DED8] rounded-md overflow-hidden">
          {activeTab === 'bookings' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#E5DED8] bg-[#FCFAF8] text-[#716A65] font-medium">
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Salon</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DED8] text-[#2D2926]">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#716A65]">No bookings found.</td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#FCFAF8]">
                        <td className="py-3 px-4 font-mono text-xs">{b.id.substring(0, 8)}</td>
                        <td className="py-3 px-4">{b.userName || 'User'}</td>
                        <td className="py-3 px-4">{b.salonName}</td>
                        <td className="py-3 px-4">{b.serviceName}</td>
                        <td className="py-3 px-4">{b.date} {b.time}</td>
                        <td className="py-3 px-4">{b.status}</td>
                        <td className="py-3 px-4">
                          {b.status !== 'Cancelled' && (
                            <button
                              onClick={() => cancelBooking(b.id)}
                              className="text-xs text-[#9D5965] hover:underline"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'salons' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#E5DED8] bg-[#FCFAF8] text-[#716A65] font-medium">
                    <th className="py-3 px-4">Salon Name</th>
                    <th className="py-3 px-4">Locality</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DED8] text-[#2D2926]">
                  {salons.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#716A65]">No salons found.</td>
                    </tr>
                  ) : (
                    salons.map((s) => (
                      <tr key={s.id} className="hover:bg-[#FCFAF8]">
                        <td className="py-3 px-4 font-medium">{s.name}</td>
                        <td className="py-3 px-4">{s.locality}</td>
                        <td className="py-3 px-4">{s.phone}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              if (confirm('Delete this salon?')) {
                                deleteSalon(s.id);
                              }
                            }}
                            className="text-xs text-[#9D5965] hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
