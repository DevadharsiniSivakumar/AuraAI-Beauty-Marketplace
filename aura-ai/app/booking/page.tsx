'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';

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

    const result = await addBooking(selectedSalonId, selectedServiceId, bookingDate, bookingTime);
    if (result) {
      setConfirmedBooking(result);
      setIsConfirmed(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAF8]">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {isConfirmed && confirmedBooking ? (
          <div className="bg-[#FFFFFF] border border-[#E5DED8] p-8 rounded-md text-center max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-[#2D2926]">Appointment Confirmed</h2>
            <p className="text-sm text-[#716A65]">Your booking has been successfully scheduled.</p>
            
            <div className="bg-[#FCFAF8] p-6 rounded-md border border-[#E5DED8] text-left space-y-4 text-sm text-[#2D2926]">
              <div className="flex justify-between border-b border-[#E5DED8] pb-2">
                <span className="font-medium">Booking ID</span>
                <span className="font-mono">{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between border-b border-[#E5DED8] pb-2">
                <span className="font-medium">Salon</span>
                <span>{confirmedBooking.salonName}</span>
              </div>
              <div className="flex justify-between border-b border-[#E5DED8] pb-2">
                <span className="font-medium">Service</span>
                <span>{confirmedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between border-b border-[#E5DED8] pb-2">
                <span className="font-medium">Date & Time</span>
                <span>{confirmedBooking.date} at {confirmedBooking.time}</span>
              </div>
              <div className="flex justify-between font-bold pt-2">
                <span>Total Paid</span>
                <span>₹{confirmedBooking.price}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-[#2D2926] text-white rounded-md text-sm font-medium hover:bg-[#1a1715] transition-colors inline-block"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#2D2926]">Book an Appointment</h1>
              <p className="text-sm text-[#716A65]">Select a salon, service, and your preferred time.</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="md:col-span-2 space-y-6">
                {/* 1. Salon & Service */}
                <div className="bg-[#FFFFFF] border border-[#E5DED8] p-6 rounded-md space-y-4">
                  <h3 className="font-bold text-[#2D2926]">1. Salon & Treatment</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2D2926] mb-1">Select Salon</label>
                      <select 
                        value={selectedSalonId}
                        onChange={handleSalonChange}
                        required
                        className="w-full px-4 py-2 border border-[#E5DED8] rounded-md bg-[#FCFAF8] text-[#2D2926] focus:outline-none focus:border-[#9D5965]"
                      >
                        <option value="">-- Choose Salon --</option>
                        {salons.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.locality})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2D2926] mb-1">Select Service</label>
                      <select 
                        value={selectedServiceId}
                        onChange={(e) => {
                          setSelectedServiceId(e.target.value);
                          setBookingDate('');
                          setBookingTime('');
                        }}
                        required
                        disabled={!selectedSalonId}
                        className="w-full px-4 py-2 border border-[#E5DED8] rounded-md bg-[#FCFAF8] text-[#2D2926] focus:outline-none focus:border-[#9D5965] disabled:opacity-50"
                      >
                        <option value="">-- Choose Service --</option>
                        {activeSalon?.services.map(ser => (
                          <option key={ser.id} value={ser.id}>{ser.name} (₹{ser.price})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Date */}
                {selectedSalonId && selectedServiceId && (
                  <div className="bg-[#FFFFFF] border border-[#E5DED8] p-6 rounded-md space-y-4">
                    <h3 className="font-bold text-[#2D2926]">2. Select Date</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {datesList.map((dt) => (
                        <button
                          key={dt.isoString}
                          type="button"
                          onClick={() => {
                            setBookingDate(dt.isoString);
                            setBookingTime('');
                          }}
                          className={`min-w-[80px] p-3 rounded-md border text-center flex flex-col transition-colors ${
                            bookingDate === dt.isoString 
                              ? 'bg-[#2D2926] border-[#2D2926] text-white' 
                              : 'border-[#E5DED8] text-[#2D2926] bg-[#FCFAF8] hover:border-[#9D5965]'
                          }`}
                        >
                          <span className="text-xs">{dt.dayName}</span>
                          <span className="text-lg font-bold">{dt.dayNum}</span>
                          <span className="text-xs">{dt.month}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Time */}
                {selectedSalonId && selectedServiceId && bookingDate && (
                  <div className="bg-[#FFFFFF] border border-[#E5DED8] p-6 rounded-md space-y-4">
                    <h3 className="font-bold text-[#2D2926]">3. Select Time</h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-[#716A65] block mb-2">Morning</span>
                        <div className="flex flex-wrap gap-2">
                          {morningSlots.map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingTime(time)}
                              className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                                bookingTime === time 
                                  ? 'bg-[#2D2926] border-[#2D2926] text-white' 
                                  : 'border-[#E5DED8] text-[#2D2926] bg-[#FCFAF8] hover:border-[#9D5965]'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-[#716A65] block mb-2">Afternoon</span>
                        <div className="flex flex-wrap gap-2">
                          {afternoonSlots.map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingTime(time)}
                              className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                                bookingTime === time 
                                  ? 'bg-[#2D2926] border-[#2D2926] text-white' 
                                  : 'border-[#E5DED8] text-[#2D2926] bg-[#FCFAF8] hover:border-[#9D5965]'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-[#716A65] block mb-2">Evening</span>
                        <div className="flex flex-wrap gap-2">
                          {eveningSlots.map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingTime(time)}
                              className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                                bookingTime === time 
                                  ? 'bg-[#2D2926] border-[#2D2926] text-white' 
                                  : 'border-[#E5DED8] text-[#2D2926] bg-[#FCFAF8] hover:border-[#9D5965]'
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

              {/* Order Summary Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-[#FFFFFF] border border-[#E5DED8] p-6 rounded-md sticky top-6 space-y-6">
                  <h3 className="font-bold text-[#2D2926]">Order Summary</h3>
                  
                  {bookingTime && activeService ? (
                    <>
                      <div className="space-y-3 text-sm text-[#2D2926] pb-4 border-b border-[#E5DED8]">
                        <div className="flex justify-between font-medium">
                          <span>{activeService.name}</span>
                          <span>₹{basePrice}</span>
                        </div>
                        <p className="text-xs text-[#716A65]">{activeSalon?.name}</p>
                      </div>

                      <div className="space-y-2 text-sm text-[#2D2926] pb-4 border-b border-[#E5DED8]">
                        <div className="flex justify-between">
                          <span>Date</span>
                          <span>{bookingDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time</span>
                          <span>{bookingTime}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-[#2D2926] pb-4">
                        <div className="flex justify-between text-[#716A65]">
                          <span>Subtotal</span>
                          <span>₹{basePrice}</span>
                        </div>
                        <div className="flex justify-between text-[#716A65]">
                          <span>Taxes (18%)</span>
                          <span>₹{gstTax}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base pt-2">
                          <span>Total</span>
                          <span>₹{totalAmount}</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-[#2D2926] text-white rounded-md text-sm font-medium hover:bg-[#1a1715] transition-colors"
                      >
                        Confirm Booking
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-[#716A65]">Please select a service, date, and time to view your summary.</p>
                  )}
                </div>
              </div>

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
    <Suspense fallback={<div className="min-h-screen bg-[#FCFAF8]" />}>
      <BookingFormContent />
    </Suspense>
  );
}
