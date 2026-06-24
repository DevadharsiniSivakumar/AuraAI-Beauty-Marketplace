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
  ArrowRight,
  Mail,
  X,
  Printer,
  Share2,
  Download,
  Check
} from 'lucide-react';

const MOTIVATIONAL_QUOTES = [
  "Every great look starts with a single appointment.",
  "Self-care isn't a luxury. It's an investment in yourself.",
  "Your next glow-up is officially scheduled.",
  "Confidence begins with taking time for yourself.",
  "Beauty is a journey. We're glad to be part of yours.",
  "Looking forward to helping you look and feel your best."
];

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

  // New booking confirmation experience states
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [randomQuote, setRandomQuote] = useState('');
  const [showEmailToast, setShowEmailToast] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalonId || !selectedServiceId || !bookingDate || !bookingTime) return;

    const result = await addBooking(selectedSalonId, selectedServiceId, bookingDate, bookingTime);
    if (result) {
      setConfirmedBooking(result);
      // Select a random quote
      const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setRandomQuote(quote);
      setIsConfirmed(true);

      // Slide down email notification toast after 1.5 seconds
      setTimeout(() => {
        setShowEmailToast(true);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        
        {/* Slide-down Email Toast */}
        {showEmailToast && confirmedBooking && (
          <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-md border border-rosegold-200 dark:border-charcoal-800 shadow-2xl rounded-2xl p-4 flex items-start gap-3.5 animate-slide-in-down">
            <div className="p-2.5 rounded-xl bg-rosegold-50 dark:bg-charcoal-800 text-rosegold-550 shrink-0">
              <Mail className="w-5 h-5 text-rosegold-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Mail • Aura</span>
                <span className="text-[10px] text-charcoal-400">Just now</span>
              </div>
              <h4 className="text-xs font-bold text-charcoal-900 dark:text-white truncate">
                Your Aura Appointment is Confirmed ✨
              </h4>
              <p className="text-[11px] text-charcoal-550 dark:text-rosegold-200 mt-0.5 line-clamp-2">
                Hi {confirmedBooking.userName}, your booking at {confirmedBooking.salonName} is officially confirmed! Tap to view details.
              </p>
              <button
                onClick={() => {
                  setShowEmailModal(true);
                  setShowEmailToast(false);
                }}
                className="text-[10px] font-bold text-rosegold-550 hover:underline mt-2 flex items-center gap-1 cursor-pointer"
              >
                Open Email
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={() => setShowEmailToast(false)}
              className="text-charcoal-400 hover:text-charcoal-600 dark:hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Email Client Simulator Modal */}
        {showEmailModal && confirmedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-xs">
            <div className="relative w-full max-w-2xl bg-white dark:bg-charcoal-900 border border-rosegold-200 dark:border-charcoal-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in">
              
              {/* Email Header */}
              <div className="p-4 bg-rosegold-50/50 dark:bg-charcoal-950 border-b border-rosegold-100 dark:border-charcoal-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rosegold-100 dark:bg-charcoal-800 text-rosegold-550">
                    <Mail className="w-4 h-4 text-rosegold-500" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-charcoal-900 dark:text-white">Email Notification Simulator</span>
                    <span className="text-[10px] text-charcoal-400">Preview of automatic email notification</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="p-1.5 rounded-xl hover:bg-rosegold-100 dark:hover:bg-charcoal-800 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Email Contents */}
              <div className="p-6 overflow-y-auto space-y-6 bg-neutral-50 dark:bg-charcoal-950 text-charcoal-900 dark:text-white flex-grow">
                
                {/* Mail Metadata */}
                <div className="p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-rosegold-100 dark:border-charcoal-800 space-y-2 text-xs">
                  <div>
                    <span className="text-charcoal-400 inline-block w-16">Subject:</span>
                    <span className="font-bold text-charcoal-900 dark:text-white">Your Aura Appointment is Confirmed ✨</span>
                  </div>
                  <div className="border-t border-rosegold-50 dark:border-charcoal-850 pt-2">
                    <span className="text-charcoal-400 inline-block w-16">From:</span>
                    <span className="font-medium text-charcoal-750 dark:text-rosegold-200">Aura &lt;appointments@auratechnologies.com&gt;</span>
                  </div>
                  <div className="border-t border-rosegold-50 dark:border-charcoal-850 pt-2">
                    <span className="text-charcoal-400 inline-block w-16">To:</span>
                    <span className="font-medium text-charcoal-750 dark:text-rosegold-200">{confirmedBooking.userName} &lt;{confirmedBooking.userEmail || 'user@auraai.com'}&gt;</span>
                  </div>
                </div>

                {/* HTML Email Body Container */}
                <div className="bg-white text-charcoal-900 border border-rosegold-150 p-8 rounded-xl max-w-lg mx-auto shadow-xs space-y-6">
                  
                  {/* Brand Logo inside Email */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1">
                      <span className="text-xs uppercase font-light tracking-widest text-charcoal-500">A U R A</span>
                      <Sparkles className="w-3.5 h-3.5 text-rosegold-500" />
                    </div>
                    <div className="h-px bg-rosegold-100 mt-4 max-w-[80px] mx-auto" />
                  </div>

                  {/* Email Greeting */}
                  <div className="space-y-2 text-left">
                    <h3 className="text-base font-bold text-charcoal-900">Appointment Confirmed</h3>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Hello {confirmedBooking.userName},
                    </p>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Thank you for choosing Aura. Your beauty appointment has been successfully scheduled. Here are the confirmation specifications for your reference:
                    </p>
                  </div>

                  {/* Email Details Box */}
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-2.5 text-left">
                    <div className="flex justify-between">
                      <span className="text-charcoal-450">Booking ID</span>
                      <span className="font-mono font-bold text-charcoal-900">{confirmedBooking.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-450">Salon Destination</span>
                      <span className="font-bold text-charcoal-900">{confirmedBooking.salonName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-450">Selected Treatment</span>
                      <span className="font-bold text-charcoal-900">{confirmedBooking.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-450">Price</span>
                      <span className="font-bold text-charcoal-900">₹{confirmedBooking.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-450">Appointment Date</span>
                      <span className="font-bold text-charcoal-900">{confirmedBooking.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-450">Appointment Time</span>
                      <span className="font-bold text-charcoal-900">{confirmedBooking.time}</span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200/65 pt-2">
                      <span className="text-charcoal-450 font-bold">Booking Status</span>
                      <span className="font-bold text-emerald-600">Confirmed</span>
                    </div>
                  </div>

                  {/* Email Sign-off */}
                  <div className="pt-2 text-xs text-charcoal-550 space-y-1 text-left">
                    <p>We look forward to helping you look and feel your best.</p>
                    <p className="pt-2 font-medium">Warmly,</p>
                    <p className="font-bold text-charcoal-800">The Aura Team</p>
                    <p className="text-[10px] text-charcoal-400">Aura Technologies</p>
                  </div>

                </div>

              </div>

              {/* Email Footer */}
              <div className="p-4 border-t border-rosegold-100 dark:border-charcoal-800 flex justify-end">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 rounded-xl bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-950 font-semibold text-xs cursor-pointer hover:bg-charcoal-950 transition-colors"
                >
                  Close Preview
                </button>
              </div>

            </div>
          </div>
        )}

        {isConfirmed && confirmedBooking ? (
          <div className="max-w-4xl mx-auto py-6 animate-fade-in space-y-8">
            
            {/* Success Heading */}
            <div className="text-center space-y-2">
              <div className="flex justify-center text-emerald-500 mb-2">
                <CheckCircle2 className="w-12 h-12 stroke-[1.5]" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-charcoal-950 dark:text-white sm:text-4xl">
                ✓ Appointment Confirmed
              </h2>
              <p className="text-sm text-charcoal-500 dark:text-rosegold-200">
                Your luxury beauty session has been scheduled successfully.
              </p>
            </div>

            {/* Split layout: Receipt card on the left/top, Table on the right/bottom */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Digital Receipt (40% width on desktop) */}
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest pl-1">Digital Receipt</h3>
                
                {/* Receipt Card */}
                <div id="digital-receipt-card" className="relative bg-white dark:bg-charcoal-900 border border-rosegold-200 dark:border-charcoal-800 rounded-2xl shadow-xl overflow-hidden print:border-none print:shadow-none">
                  
                  {/* Top Bar Decoration */}
                  <div className="h-1.5 bg-linear-to-r from-rosegold-400 via-gold-metallic to-rosegold-550" />
                  
                  <div className="p-6 space-y-6 text-left">
                    {/* Header */}
                    <div className="flex justify-between items-center pb-4 border-b border-dashed border-rosegold-100 dark:border-charcoal-800">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold tracking-widest text-xs uppercase text-charcoal-900 dark:text-white">A U R A</span>
                        <Sparkles className="w-3.5 h-3.5 text-rosegold-500" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                        Confirmed
                      </span>
                    </div>

                    {/* Receipt Body Info */}
                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="block text-[10px] text-charcoal-400 uppercase tracking-wider mb-0.5">Booking ID</span>
                        <span className="font-mono font-medium text-charcoal-900 dark:text-white">{confirmedBooking.id}</span>
                      </div>
                      
                      <div>
                        <span className="block text-[10px] text-charcoal-400 uppercase tracking-wider mb-0.5">Customer Name</span>
                        <span className="font-semibold text-charcoal-900 dark:text-white">{confirmedBooking.userName}</span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-charcoal-400 uppercase tracking-wider mb-0.5">Salon Destination</span>
                        <span className="font-semibold text-charcoal-900 dark:text-white">{confirmedBooking.salonName}</span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-charcoal-400 uppercase tracking-wider mb-0.5">Selected Treatment</span>
                        <span className="font-semibold text-charcoal-950 dark:text-white">{confirmedBooking.serviceName}</span>
                        <span className="block text-charcoal-550 dark:text-rosegold-300 mt-0.5 font-medium">₹{confirmedBooking.price}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[10px] text-charcoal-400 uppercase tracking-wider mb-0.5">Appointment Date</span>
                          <span className="font-semibold text-charcoal-900 dark:text-white">{confirmedBooking.date}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-charcoal-400 uppercase tracking-wider mb-0.5">Appointment Time</span>
                          <span className="font-semibold text-charcoal-900 dark:text-white">{confirmedBooking.time}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="block text-[10px] text-charcoal-400 uppercase tracking-wider mb-0.5">Created Timestamp</span>
                        <span className="text-[11px] text-charcoal-500 dark:text-rosegold-200">
                          {new Date(confirmedBooking.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Tear-off dash divider */}
                    <div className="relative flex items-center justify-between py-2">
                      <div className="absolute -left-8 w-4 h-4 rounded-full bg-rosegold-50 dark:bg-charcoal-950 border-r border-rosegold-200 dark:border-charcoal-800" />
                      <div className="w-full border-t border-dashed border-rosegold-200 dark:border-charcoal-800" />
                      <div className="absolute -right-8 w-4 h-4 rounded-full bg-rosegold-50 dark:bg-charcoal-950 border-l border-rosegold-200 dark:border-charcoal-800" />
                    </div>

                    {/* Barcode Simulation */}
                    <div className="text-center pt-2 space-y-2">
                      {/* Fake Barcode Lines */}
                      <div className="flex justify-center items-stretch h-8 gap-0.5 opacity-70">
                        {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 1, 3, 2, 4, 1, 2, 1, 3, 1, 2].map((w, idx) => (
                          <div key={idx} className="bg-charcoal-900 dark:bg-white" style={{ width: `${w}px` }} />
                        ))}
                      </div>
                      <span className="text-[9px] text-charcoal-400 font-mono tracking-widest uppercase">AURA-SECURE-ENTRY</span>
                    </div>

                  </div>
                </div>

                {/* Print/Share Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-rosegold-200 dark:border-charcoal-800 text-xs font-semibold text-charcoal-700 dark:text-rosegold-200 bg-white hover:bg-rosegold-50/50 dark:bg-charcoal-900 dark:hover:bg-charcoal-800 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Receipt
                  </button>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'My Aura Appointment',
                          text: `I booked ${confirmedBooking.serviceName} at ${confirmedBooking.salonName} via Aura!`,
                          url: window.location.href,
                        }).catch(console.error);
                      } else {
                        // Fallback
                        navigator.clipboard.writeText(`Aura Appointment: ${confirmedBooking.serviceName} at ${confirmedBooking.salonName} on ${confirmedBooking.date} at ${confirmedBooking.time}. Booking ID: ${confirmedBooking.id}`);
                        alert('Appointment details copied to clipboard!');
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-rosegold-200 dark:border-charcoal-800 text-xs font-semibold text-charcoal-700 dark:text-rosegold-200 bg-white hover:bg-rosegold-50/50 dark:bg-charcoal-900 dark:hover:bg-charcoal-800 transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share Receipt
                  </button>
                </div>

              </div>

              {/* Right Column: Text Summary & Motivational Quote (60% width on desktop) */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Details Table */}
                <div className="p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-4 text-left">
                  <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">Booking Specifications</h3>
                  
                  <div className="divide-y divide-rosegold-100 dark:divide-charcoal-800 text-sm">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-charcoal-450 dark:text-rosegold-300">Customer Name</span>
                      <span className="font-semibold text-charcoal-900 dark:text-white">{confirmedBooking.userName}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-charcoal-450 dark:text-rosegold-300">Salon Name</span>
                      <span className="font-semibold text-charcoal-900 dark:text-white">{confirmedBooking.salonName}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-charcoal-450 dark:text-rosegold-300">Service Name</span>
                      <span className="font-semibold text-charcoal-900 dark:text-white">{confirmedBooking.serviceName}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-charcoal-450 dark:text-rosegold-300">Date</span>
                      <span className="font-semibold text-charcoal-900 dark:text-white">{confirmedBooking.date}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-charcoal-450 dark:text-rosegold-300">Time</span>
                      <span className="font-semibold text-charcoal-900 dark:text-white">{confirmedBooking.time}</span>
                    </div>
                    <div className="py-2.5 flex justify-between font-mono text-xs">
                      <span className="text-charcoal-455 dark:text-rosegold-300 font-sans">Booking ID</span>
                      <span className="text-charcoal-900 dark:text-white font-medium">{confirmedBooking.id}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-charcoal-450 dark:text-rosegold-300">Booking Status</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Confirmed</span>
                    </div>
                  </div>
                </div>

                {/* Motivational Success Card */}
                {randomQuote && (
                  <div className="p-6 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-850 bg-rosegold-50/10 dark:bg-charcoal-900/30 flex items-start gap-4 text-left">
                    <Sparkles className="w-5 h-5 text-rosegold-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-rosegold-500 uppercase tracking-widest font-bold mb-1">AURA NOTE</span>
                      <p className="italic text-charcoal-600 dark:text-rosegold-200 text-sm leading-relaxed">
                        "{randomQuote}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 flex items-center justify-center py-3 rounded-xl bg-charcoal-900 text-white font-semibold text-sm shadow-md hover:bg-charcoal-950 hover:scale-101 transition-all cursor-pointer dark:bg-white dark:text-charcoal-950 dark:hover:bg-rosegold-50"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="flex-1 flex items-center justify-center py-3 rounded-xl border border-rosegold-200 dark:border-charcoal-800 text-charcoal-700 dark:text-rosegold-200 bg-white hover:bg-rosegold-50/50 dark:bg-charcoal-900 dark:hover:bg-charcoal-800 font-semibold text-sm transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    View Confirmation Email
                  </button>
                </div>

              </div>

            </div>

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
