'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientConsoleLayout from '../components/ClientConsoleLayout';
import { useApp } from '../context/AppContext';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { salons, addBooking } = useApp();

  const initialSalonId = searchParams.get('salon') || '';
  const initialServiceId = searchParams.get('service') || '';

  const [selectedSalonId, setSelectedSalonId] = useState(initialSalonId);
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  
  const [bookingState, setBookingState] = useState<'draft' | 'submitting' | 'success'>('draft');
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const activeSalon = salons.find(s => s.id === selectedSalonId);
  const activeService = activeSalon?.services.find(s => s.id === selectedServiceId);

  useEffect(() => {
    if (initialSalonId) setSelectedSalonId(initialSalonId);
    if (initialServiceId) setSelectedServiceId(initialServiceId);
  }, [initialSalonId, initialServiceId]);

  const handleSalonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSalonId(e.target.value);
    setSelectedServiceId('');
    setBookingDate('');
    setBookingTime('');
  };

  const getDatesList = () => {
    const dates = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 1; i <= 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        dayName: days[d.getDay()],
        dayNum: d.getDate(),
        month: months[d.getMonth()],
        isoString: d.toISOString().split('T')[0]
      });
    }
    return dates;
  };

  const datesList = getDatesList();
  const morningSlots = ['10:00 AM', '11:00 AM', '11:30 AM'];
  const afternoonSlots = ['12:30 PM', '1:30 PM', '3:00 PM', '4:30 PM'];
  const eveningSlots = ['5:30 PM', '6:30 PM', '7:30 PM'];

  const basePrice = activeService?.price || 0;
  const gstTax = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + gstTax;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalonId || !selectedServiceId || !bookingDate || !bookingTime) return;

    setBookingState('submitting');
    
    // Simulate network delay for polish
    setTimeout(async () => {
      const result = await addBooking(selectedSalonId, selectedServiceId, bookingDate, bookingTime);
      if (result) {
        setConfirmedBooking(result);
        setBookingState('success');

        // Trigger confirmation email
        try {
          fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerName: result.userName,
              bookingId: result.id,
              salonName: result.salonName,
              serviceName: result.serviceName,
              date: result.date,
              time: result.time,
              bookingStatus: 'Confirmed',
              userEmail: result.userEmail
            })
          });
        } catch (err) {
          console.error("Error triggering email send:", err);
        }
      } else {
        setBookingState('draft');
      }
    }, 800);
  };

  return (
    <ClientConsoleLayout activeSidebarItem="bookings" headerTitle="Book Appointment">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {bookingState === 'success' && confirmedBooking ? (
          <div className="max-w-2xl mx-auto mt-10 animate-in slide-in-from-bottom-4">
            <div className="bg-white border border-border rounded-xl shadow-lg overflow-hidden">
              <div className="bg-sage p-8 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-sage opacity-50"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-sage text-3xl shadow-sm">
                    ✓
                  </div>
                  <h2 className="font-serif text-3xl font-medium mb-2">Booking Confirmed</h2>
                  <p className="text-white/90">Your appointment is set and a confirmation email is on the way.</p>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <span className="text-mutedtext">Booking ID</span>
                    <span className="font-mono font-medium text-darktext">{confirmedBooking.id}</span>
                  </div>
                  
                  <div className="flex items-start gap-4 border-b border-border pb-6">
                    <div className="w-16 h-16 bg-cream rounded-lg flex items-center justify-center border border-border">
                      <span className="text-xl">📍</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-darktext text-lg">{confirmedBooking.salonName}</h3>
                      <p className="text-mutedtext text-sm">Detailed directions are in your email</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pb-6 border-b border-border">
                    <div>
                      <p className="text-xs text-mutedtext uppercase tracking-wider mb-1">Service</p>
                      <p className="font-medium text-darktext">{confirmedBooking.serviceName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-mutedtext uppercase tracking-wider mb-1">Date & Time</p>
                      <p className="font-medium text-darktext">{confirmedBooking.date} at {confirmedBooking.time}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4 justify-center">
                  <Link href="/dashboard" className="px-6 py-3 bg-white border border-border text-darktext rounded-md font-medium hover:bg-cream transition-colors">
                    View My Bookings
                  </Link>
                  <Link href="/salons" className="px-6 py-3 bg-plum text-warmwhite rounded-md font-medium hover:bg-plum-dark transition-colors">
                    Explore More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left: Booking Form */}
            <div className="w-full lg:w-[65%]">
              <div className="mb-8">
                <h1 className="font-serif text-3xl md:text-4xl text-darktext mb-3">Complete your booking</h1>
                <p className="text-mutedtext">Select your preferred date and time for the appointment.</p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-10">
                
                {/* 1. Salon Selection */}
                <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
                  <h2 className="text-xl font-medium text-darktext mb-6">1. Salon & Service</h2>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-mutedtext mb-2">Location</label>
                      <select 
                        value={selectedSalonId}
                        onChange={handleSalonChange}
                        required
                        className="w-full p-3 bg-cream border border-border rounded-lg text-darktext focus:outline-none focus:border-plum"
                      >
                        <option value="">Select a salon...</option>
                        {salons.map(s => (
                          <option key={s.id} value={s.id}>{s.name} - {s.location}</option>
                        ))}
                      </select>
                    </div>

                    {activeSalon && (
                      <div className="animate-in fade-in">
                        <label className="block text-sm font-medium text-mutedtext mb-2">Service</label>
                        <select 
                          value={selectedServiceId}
                          onChange={(e) => setSelectedServiceId(e.target.value)}
                          required
                          className="w-full p-3 bg-cream border border-border rounded-lg text-darktext focus:outline-none focus:border-plum"
                        >
                          <option value="">Select a service...</option>
                          {activeSalon.services.map(s => (
                            <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Date & Time Selection */}
                <div className={`bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm transition-opacity duration-300 ${!selectedServiceId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                  <h2 className="text-xl font-medium text-darktext mb-6">2. Date & Time</h2>
                  
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-mutedtext mb-3">Select Date</label>
                    <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 scrollbar-hide">
                      {datesList.map((d, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setBookingDate(d.isoString)}
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-[88px] h-[96px] rounded-lg border transition-all ${
                            bookingDate === d.isoString 
                              ? 'bg-plum text-warmwhite border-plum shadow-md' 
                              : 'bg-white border-border text-darktext hover:border-plum/50'
                          }`}
                        >
                          <span className="text-xs uppercase font-medium tracking-wider mb-1 opacity-80">{d.month}</span>
                          <span className="text-2xl font-serif">{d.dayNum}</span>
                          <span className="text-xs mt-1">{d.dayName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`transition-opacity duration-300 ${!bookingDate ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <label className="block text-sm font-medium text-mutedtext mb-3">Select Time</label>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-medium text-mutedtext mb-3 uppercase tracking-wider">Morning</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {morningSlots.map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingTime(time)}
                              className={`py-2 px-2 text-sm rounded-md border transition-colors ${
                                bookingTime === time 
                                  ? 'bg-plum text-warmwhite border-plum shadow-sm' 
                                  : 'bg-cream border-border text-darktext hover:border-plum/50'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-mutedtext mb-3 uppercase tracking-wider">Afternoon</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {afternoonSlots.map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingTime(time)}
                              className={`py-2 px-2 text-sm rounded-md border transition-colors ${
                                bookingTime === time 
                                  ? 'bg-plum text-warmwhite border-plum shadow-sm' 
                                  : 'bg-cream border-border text-darktext hover:border-plum/50'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-mutedtext mb-3 uppercase tracking-wider">Evening</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {eveningSlots.map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingTime(time)}
                              className={`py-2 px-2 text-sm rounded-md border transition-colors ${
                                bookingTime === time 
                                  ? 'bg-plum text-warmwhite border-plum shadow-sm' 
                                  : 'bg-cream border-border text-darktext hover:border-plum/50'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Submit Button (Hidden on Desktop) */}
                <div className="lg:hidden">
                  <button 
                    type="submit"
                    disabled={bookingState === 'submitting' || !selectedServiceId || !bookingDate || !bookingTime}
                    className="w-full bg-plum text-warmwhite py-4 rounded-lg font-medium hover:bg-plum-dark transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
                  >
                    {bookingState === 'submitting' ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Confirming...
                      </span>
                    ) : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Order Summary Panel */}
            <div className="w-full lg:w-[35%] relative">
              <div className="sticky top-[100px] bg-white rounded-xl border border-border shadow-md overflow-hidden">
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-medium text-darktext mb-6">Order Summary</h3>
                  
                  {activeSalon && activeService ? (
                    <div className="space-y-6 animate-in fade-in">
                      <div className="flex gap-4 items-start">
                        <div className="w-16 h-16 bg-cream border border-border rounded-lg flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-darktext">{activeSalon.name}</h4>
                          <p className="text-sm text-mutedtext">{activeSalon.location}</p>
                        </div>
                      </div>

                      <div className="border-t border-border pt-6">
                        <div className="flex justify-between text-sm mb-4">
                          <span className="text-darktext">{activeService.name}</span>
                          <span className="font-medium text-darktext">₹{activeService.price}</span>
                        </div>
                        <div className="flex justify-between text-sm text-mutedtext mb-4">
                          <span>Taxes & Fees</span>
                          <span>₹{gstTax}</span>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4 pb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-darktext">Total</span>
                          <span className="font-serif text-2xl text-darktext">₹{totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-mutedtext text-sm bg-cream border border-dashed border-border rounded-lg">
                      Select a salon and service<br/>to see the summary
                    </div>
                  )}

                  {/* Desktop Submit Button */}
                  <div className="hidden lg:block mt-8">
                    <button 
                      onClick={handleBookingSubmit}
                      disabled={bookingState === 'submitting' || !selectedServiceId || !bookingDate || !bookingTime}
                      className="w-full bg-plum text-warmwhite py-4 rounded-lg font-medium hover:bg-plum-dark transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
                    >
                      {bookingState === 'submitting' ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Confirming...
                        </span>
                      ) : 'Confirm Appointment'}
                    </button>
                    <p className="text-center text-xs text-mutedtext mt-4">
                      By booking this appointment, you agree to the cancellation policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </ClientConsoleLayout>
  );
}
