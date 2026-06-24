'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  Scissors,
  ArrowRight
} from 'lucide-react';

function BookingFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { salons, addBooking } = useApp();

  // Selected parameters from query strings
  const initialSalonId = searchParams.get('salon') || '';
  const initialServiceId = searchParams.get('service') || '';

  const [selectedSalonId, setSelectedSalonId] = useState(initialSalonId);
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const activeSalon = salons.find(s => s.id === selectedSalonId);
  const activeService = activeSalon?.services.find(s => s.id === selectedServiceId);

  // Sync state if query parameters update
  useEffect(() => {
    if (initialSalonId) setSelectedSalonId(initialSalonId);
    if (initialServiceId) setSelectedServiceId(initialServiceId);
  }, [initialSalonId, initialServiceId]);

  // Handle salon switch
  const handleSalonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSalonId(e.target.value);
    setSelectedServiceId(''); // reset service
    setBookingDate(''); // reset date
    setBookingTime(''); // reset time
  };

  // Preset calendar days (next 5 days)
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

  // Preset time slots
  const morningSlots = ['10:00 AM', '11:00 AM', '11:30 AM'];
  const afternoonSlots = ['12:30 PM', '1:30 PM', '3:00 PM', '4:30 PM'];
  const eveningSlots = ['5:30 PM', '6:30 PM', '7:30 PM'];

  // Price calculations
  const basePrice = activeService?.price || 0;
  const gstTax = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + gstTax;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalonId || !selectedServiceId || !bookingDate || !bookingTime) return;

    addBooking(selectedSalonId, selectedServiceId, bookingDate, bookingTime);
    setIsConfirmed(true);

    // Redirect to dashboard after a delay to show success card
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {isConfirmed ? (
          <div className="max-w-md mx-auto text-center p-8 rounded-3xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-xl space-y-4 my-12 animate-pulse-slow">
            <div className="flex justify-center text-emerald-500 mb-2">
              <CheckCircle2 className="w-16 h-16" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal-950 dark:text-white">Booking Confirmed!</h2>
            <p className="text-sm text-charcoal-500 dark:text-rosegold-350">
              Your appointment at <strong>{activeSalon?.name}</strong> has been successfully scheduled.
            </p>
            <div className="p-4 rounded-xl bg-rosegold-50/20 dark:bg-charcoal-950/20 border border-rosegold-100 dark:border-charcoal-800 text-xs text-charcoal-600 dark:text-rosegold-200 text-left space-y-1.5 font-mono">
              <p><strong>Service:</strong> {activeService?.name}</p>
              <p><strong>Date:</strong> {bookingDate}</p>
              <p><strong>Time:</strong> {bookingTime}</p>
              <p><strong>Total Paid:</strong> ₹{totalAmount}</p>
            </div>
            <p className="text-xs text-charcoal-400 pt-2">Redirecting to client dashboard...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-950 dark:text-white">Schedule Appointment</h1>
              <p className="text-sm text-charcoal-550 dark:text-rosegold-200">Confirm salon coordinates, schedule dates, and book secure wellness bookings.</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Input fields */}
              <div className={`space-y-6 transition-all duration-500 ${bookingTime ? 'lg:col-span-2' : 'lg:col-span-3 max-w-3xl mx-auto w-full'}`}>
                
                {/* Salon & Service Selection Card */}
                <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-4">
                  <h3 className="font-bold text-charcoal-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-rosegold-550" />
                    1. Destination & Treatment
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Select Salon</label>
                      <select 
                        value={selectedSalonId}
                        onChange={handleSalonChange}
                        required
                        className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
                      >
                        <option value="" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">-- Choose Salon --</option>
                        {salons.map(s => (
                          <option key={s.id} value={s.id} className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">{s.name} ({s.locality})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Select Service</label>
                      <select 
                        value={selectedServiceId}
                        onChange={(e) => {
                          setSelectedServiceId(e.target.value);
                          setBookingDate('');
                          setBookingTime('');
                        }}
                        required
                        disabled={!selectedSalonId}
                        className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 disabled:opacity-50"
                      >
                        <option value="" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">-- Choose Service --</option>
                        {activeSalon?.services.map(ser => (
                          <option key={ser.id} value={ser.id} className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white">{ser.name} (₹{ser.price})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Date Picker Grid */}
                {selectedSalonId && selectedServiceId && (
                  <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-4 animate-fade-in">
                    <h3 className="font-bold text-charcoal-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-rosegold-550" />
                      2. Select Appointment Date
                    </h3>
                    
                    <div className="grid grid-cols-5 gap-2">
                      {datesList.map((dt) => (
                        <button
                          key={dt.isoString}
                          type="button"
                          onClick={() => {
                            setBookingDate(dt.isoString);
                            setBookingTime('');
                          }}
                          className={`p-3 rounded-xl border text-center flex flex-col justify-center space-y-1 transition-all cursor-pointer ${
                            bookingDate === dt.isoString 
                              ? 'bg-rosegold-500 border-rosegold-500 text-white font-semibold' 
                              : 'border-rosegold-200 dark:border-charcoal-800 text-charcoal-600 dark:text-rosegold-200 hover:bg-rosegold-50 dark:hover:bg-charcoal-800'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-light">{dt.dayName}</span>
                          <span className="text-lg font-bold">{dt.dayNum}</span>
                          <span className="text-[9px] uppercase font-semibold">{dt.month}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time Slots Grid */}
                {selectedSalonId && selectedServiceId && bookingDate && (
                  <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-5 animate-fade-in">
                    <h3 className="font-bold text-charcoal-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Clock className="w-4 h-4 text-rosegold-550" />
                      3. Select Time Slot
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Morning */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400">Morning Slots</span>
                        <div className="flex flex-wrap gap-2">
                          {morningSlots.map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingTime(time)}
                              className={`px-4 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                                bookingTime === time 
                                  ? 'bg-rosegold-500 border-rosegold-500 text-white font-semibold' 
                                  : 'border-rosegold-200 dark:border-charcoal-800 text-charcoal-600 dark:text-rosegold-200 hover:bg-rosegold-50 dark:hover:bg-charcoal-800'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Afternoon */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400">Afternoon Slots</span>
                        <div className="flex flex-wrap gap-2">
                          {afternoonSlots.map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingTime(time)}
                              className={`px-4 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                                bookingTime === time 
                                  ? 'bg-rosegold-500 border-rosegold-500 text-white font-semibold' 
                                  : 'border-rosegold-200 dark:border-charcoal-800 text-charcoal-600 dark:text-rosegold-200 hover:bg-rosegold-50 dark:hover:bg-charcoal-800'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Evening */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400">Evening Slots</span>
                        <div className="flex flex-wrap gap-2">
                          {eveningSlots.map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingTime(time)}
                              className={`px-4 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                                bookingTime === time 
                                  ? 'bg-rosegold-500 border-rosegold-500 text-white font-semibold' 
                                  : 'border-rosegold-200 dark:border-charcoal-800 text-charcoal-600 dark:text-rosegold-200 hover:bg-rosegold-50 dark:hover:bg-charcoal-800'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Sidebar Invoice & Secure checkout */}
              {bookingTime && activeService && (
                <div className="lg:col-span-1 space-y-6 animate-fade-in">
                  
                  <div className="p-6 rounded-2xl border border-rosegold-350 dark:border-charcoal-850 bg-linear-to-b from-rosegold-100/15 to-white dark:from-charcoal-900 dark:to-charcoal-950 space-y-6 shadow-sm">
                    <h3 className="font-bold text-charcoal-950 dark:text-white text-base">Booking Summary</h3>
                    
                    <div className="space-y-4 text-xs">
                      {/* Service line items */}
                      <div className="space-y-2 pb-4 border-b border-rosegold-100 dark:border-charcoal-800">
                        <div className="flex justify-between font-semibold">
                          <span className="text-charcoal-900 dark:text-white">{activeService.name}</span>
                          <span className="text-charcoal-900 dark:text-white">₹{basePrice}</span>
                        </div>
                        <p className="text-[11px] text-charcoal-400">{activeSalon?.name} ({activeSalon?.locality})</p>
                      </div>

                      {/* Date & time summary */}
                      <div className="space-y-2 pb-4 border-b border-rosegold-100 dark:border-charcoal-800 text-charcoal-600 dark:text-rosegold-200">
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span className="font-semibold">{bookingDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time Slot:</span>
                          <span className="font-semibold">{bookingTime}</span>
                        </div>
                      </div>

                      {/* Pricing breakdown */}
                      <div className="space-y-2 pb-4">
                        <div className="flex justify-between text-charcoal-500">
                          <span>Subtotal:</span>
                          <span>₹{basePrice}</span>
                        </div>
                        <div className="flex justify-between text-charcoal-500">
                          <span>GST Tax (18%):</span>
                          <span>₹{gstTax}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-charcoal-950 dark:text-white pt-2 border-t border-dashed border-rosegold-200">
                          <span>Grand Total:</span>
                          <span>₹{totalAmount}</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center py-3 rounded-xl bg-linear-to-r from-rosegold-500 to-gold-metallic text-white font-semibold text-sm shadow-md hover:scale-101 hover:shadow-lg transition-all cursor-pointer group"
                      >
                        Confirm Booking
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    <div className="pt-4 border-t border-rosegold-100 dark:border-charcoal-800 text-center">
                      <span className="text-[10px] text-charcoal-450 font-light flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        100% Secure Checkout Guarantee
                      </span>
                    </div>
                  </div>

                </div>
              )}

            </form>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-rosegold-50 dark:bg-charcoal-950">
        <div className="w-8 h-8 border-4 border-rosegold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <BookingFormContent />
    </Suspense>
  );
}
