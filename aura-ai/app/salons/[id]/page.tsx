'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useApp } from '../../context/AppContext';

export default function SalonDetails() {
  const params = useParams();
  const router = useRouter();
  const { salons, user } = useApp();
  
  const id = params.id as string;
  const salon = salons.find(s => s.id === id);

  const [bookingService, setBookingService] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  if (!salon) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FCFAF8]">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-[#2D2926]">Salon Not Found</h2>
          <p className="text-[#716A65] mt-2 mb-6">The salon you are looking for does not exist.</p>
          <Link href="/salons" className="text-sm font-medium text-[#FFFFFF] bg-[#2D2926] px-4 py-2 rounded-md hover:bg-[#1a1715] transition-colors">
            Back to Salons
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingService || !bookingDate || !bookingTime) return;
    router.push(`/booking?salon=${salon.id}&service=${bookingService}&date=${bookingDate}&time=${bookingTime}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAF8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Breadcrumb */}
        <nav className="text-sm text-[#716A65]">
          <Link href="/" className="hover:text-[#9D5965]">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/salons" className="hover:text-[#9D5965]">Salons</Link>
          <span className="mx-2">/</span>
          <span className="text-[#2D2926] font-medium">{salon.name}</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#2D2926]">{salon.name}</h1>
          <p className="text-sm text-[#716A65] mt-1">
            {salon.location} · ★ {salon.rating} ({salon.reviewsCount} reviews)
          </p>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[300px] md:h-[400px]">
          <div className="md:col-span-2 rounded-md overflow-hidden bg-gray-200 border border-[#E5DED8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={salon.gallery[0] || salon.image} 
              alt={salon.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="hidden md:flex flex-col gap-4">
            <div className="flex-1 rounded-md overflow-hidden bg-gray-200 border border-[#E5DED8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={salon.gallery[1] || salon.image} 
                alt={`${salon.name} 2`} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 rounded-md overflow-hidden bg-gray-200 border border-[#E5DED8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={salon.gallery[2] || salon.image} 
                alt={`${salon.name} 3`} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>

        {/* Layout: Main Left, Booking Right */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          <div className="flex-1 w-full space-y-12">
            
            {/* About */}
            <section className="border-b border-[#E5DED8] pb-12">
              <h2 className="text-xl font-bold text-[#2D2926] mb-4">About</h2>
              <p className="text-sm text-[#716A65] leading-relaxed whitespace-pre-wrap">
                {salon.description}
              </p>
            </section>

            {/* Services */}
            <section className="border-b border-[#E5DED8] pb-12">
              <h2 className="text-xl font-bold text-[#2D2926] mb-6">Services</h2>
              <div className="space-y-6">
                {salon.services?.map((service) => (
                  <div key={service.id} className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h3 className="font-bold text-[#2D2926]">{service.name}</h3>
                      <p className="text-sm text-[#716A65] mt-1">{service.description}</p>
                      <span className="text-xs text-[#716A65] block mt-2">{service.duration}</span>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <span className="font-bold text-[#2D2926]">₹{service.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="border-b border-[#E5DED8] pb-12">
              <h2 className="text-xl font-bold text-[#2D2926] mb-6">Reviews</h2>
              {salon.reviews && salon.reviews.length > 0 ? (
                <div className="space-y-6">
                  {salon.reviews.map((review) => (
                    <div key={review.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2D2926] text-sm">{review.author}</span>
                        <span className="text-[#716A65] text-xs px-1">—</span>
                        <span className="text-[#716A65] text-xs">{review.date}</span>
                        <span className="text-[#716A65] text-xs px-1">—</span>
                        <span className="text-[#2D2926] text-xs font-bold">★ {review.rating}</span>
                      </div>
                      <p className="text-sm text-[#716A65]">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#716A65]">No reviews yet.</p>
              )}
            </section>
          </div>

          {/* Booking Box */}
          <div className="w-full lg:w-96 lg:sticky lg:top-24 bg-[#FFFFFF] border border-[#E5DED8] rounded-md p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#2D2926] mb-6">Book an appointment</h3>
            
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#716A65] uppercase tracking-wider">Service</label>
                <select 
                  required
                  value={bookingService}
                  onChange={(e) => setBookingService(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5DED8] rounded-md bg-[#FFFFFF] text-sm text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
                >
                  <option value="">Select a service...</option>
                  {salon.services?.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - ₹{s.price}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#716A65] uppercase tracking-wider">Date</label>
                <input 
                  type="date" 
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-[#E5DED8] rounded-md bg-[#FFFFFF] text-sm text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#716A65] uppercase tracking-wider">Time</label>
                <select 
                  required
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5DED8] rounded-md bg-[#FFFFFF] text-sm text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
                >
                  <option value="">Select a time...</option>
                  {['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#2D2926] text-white py-3 rounded-md text-sm font-medium hover:bg-[#1a1715] transition-colors mt-4"
              >
                Continue
              </button>
            </form>
          </div>

        </div>

      </main>
      
      <Footer />
    </div>
  );
}
