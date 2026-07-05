'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useApp } from '../../context/AppContext';
import { useParams } from 'next/navigation';

export default function SalonDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { salons, addFavorite, removeFavorite, isFavorite } = useApp();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'reviews'>('services');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  const id = params?.id as string;
  const salon = salons.find(s => s.id === id);

  if (!salon) {
    return (
      <div className="flex flex-col min-h-screen bg-cream">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-darktext mb-2">Salon not found</h1>
            <p className="text-mutedtext mb-6">The salon you are looking for does not exist.</p>
            <Link href="/salons" className="text-plum hover:underline">Return to search</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Group services by category
  const categories = Array.from(new Set(salon.services.map(s => s.category)));
  
  const selectedService = salon.services.find(s => s.id === selectedServiceId) || salon.services[0];

  const handleBook = () => {
    if (selectedServiceId) {
      router.push(`/booking?salon=${salon.id}&service=${selectedServiceId}`);
    } else {
      router.push(`/booking?salon=${salon.id}&service=${salon.services[0].id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Navbar />

      <main className="flex-grow pb-24">
        {/* Header Section */}
        <div className="bg-warmwhite border-b border-border pt-8 pb-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-sm text-mutedtext mb-6">
              <Link href="/" className="hover:text-plum transition-colors">Home</Link> 
              <span className="mx-2">/</span> 
              <Link href="/salons" className="hover:text-plum transition-colors">Salons</Link> 
              <span className="mx-2">/</span> 
              <span className="text-darktext font-medium">{salon.name}</span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="font-serif text-3xl md:text-5xl text-darktext mb-3">{salon.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="text-mutedtext flex items-center gap-1">
                    📍 {salon.location}
                  </span>
                  <span className="text-border-dark hidden md:inline">|</span>
                  <div className="flex items-center gap-1">
                    <span className="text-gold">★</span>
                    <span className="font-medium text-darktext">{salon.rating}</span>
                    <span className="text-mutedtext underline decoration-border underline-offset-4 hover:decoration-mutedtext cursor-pointer transition-colors" onClick={() => setActiveTab('reviews')}>
                      {salon.reviewsCount} verified reviews
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => isFavorite(salon.id) ? removeFavorite(salon.id) : addFavorite(salon.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-white text-darktext text-sm font-medium hover:bg-cream transition-colors shadow-sm"
                >
                  <span className={isFavorite(salon.id) ? "text-rose text-lg leading-none" : "text-mutedtext text-lg leading-none"}>
                    {isFavorite(salon.id) ? '♥' : '♡'}
                  </span>
                  {isFavorite(salon.id) ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Gallery */}
          <div className="mb-12">
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[400px]">
              {/* Large Image */}
              <div className="col-span-2 row-span-2 bg-sage/20 rounded-l-xl overflow-hidden relative border border-border">
                <div className="absolute inset-0 bg-sage opacity-10"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-30 text-sage">Main Image</div>
              </div>
              {/* Small Images */}
              <div className="col-span-1 row-span-1 bg-lavender/20 relative border border-border border-l-0"><div className="absolute inset-0 flex items-center justify-center opacity-30 text-lavender">Interior</div></div>
              <div className="col-span-1 row-span-1 bg-coral/20 rounded-tr-xl relative border border-border border-l-0"><div className="absolute inset-0 flex items-center justify-center opacity-30 text-coral">Products</div></div>
              <div className="col-span-1 row-span-1 bg-peach/20 relative border border-border border-l-0 border-t-0"><div className="absolute inset-0 flex items-center justify-center opacity-30 text-peach">Staff</div></div>
              <div className="col-span-1 row-span-1 bg-rose/20 rounded-br-xl relative border border-border border-l-0 border-t-0"><div className="absolute inset-0 flex items-center justify-center opacity-30 text-rose">Exterior</div></div>
            </div>
            
            {/* Mobile Swipeable Gallery */}
            <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 scrollbar-hide">
              {[1,2,3,4].map(i => (
                <div key={i} className="min-w-[85vw] aspect-[4/3] bg-sage/20 rounded-lg snap-center relative border border-border">
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 text-sage">Image {i}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Split Layout */}
          <div className="flex flex-col lg:flex-row gap-12 relative">
            
            {/* 65% Main Content */}
            <div className="w-full lg:w-[65%]">
              
              {/* Navigation */}
              <div className="flex border-b border-border mb-8 sticky top-[72px] bg-cream z-30 pt-4">
                {['overview', 'services', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-4 px-6 text-sm font-medium capitalize transition-colors border-b-2 -mb-[1px] ${
                      activeTab === tab 
                        ? 'border-plum text-plum' 
                        : 'border-transparent text-mutedtext hover:text-darktext hover:border-border'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                
                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-8 animate-in fade-in">
                    <div>
                      <h2 className="text-xl font-serif text-darktext mb-4">About {salon.name}</h2>
                      <p className="text-mutedtext leading-relaxed">
                        Experience premium beauty and wellness services in the heart of {salon.location}. 
                        Our expert team is dedicated to providing personalized treatments in a relaxing, hygienic environment.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-white p-5 rounded-lg border border-border shadow-sm">
                        <h3 className="font-medium text-darktext mb-3">Amenities</h3>
                        <ul className="space-y-2 text-sm text-mutedtext">
                          <li className="flex items-center gap-2">✓ Free WiFi</li>
                          <li className="flex items-center gap-2">✓ Parking Available</li>
                          <li className="flex items-center gap-2">✓ Beverage Service</li>
                        </ul>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-border shadow-sm">
                        <h3 className="font-medium text-darktext mb-3">Operating Hours</h3>
                        <ul className="space-y-2 text-sm text-mutedtext">
                          <li className="flex justify-between"><span>Mon - Fri</span> <span>10:00 AM - 8:00 PM</span></li>
                          <li className="flex justify-between"><span>Sat - Sun</span> <span>9:00 AM - 9:00 PM</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* SERVICES */}
                {activeTab === 'services' && (
                  <div className="space-y-10 animate-in fade-in">
                    {categories.map(cat => (
                      <div key={cat}>
                        <h2 className="text-xl font-serif text-darktext mb-6 capitalize">{cat} Services</h2>
                        <div className="flex flex-col gap-4">
                          {salon.services.filter(s => s.category === cat).map((svc) => (
                            <div 
                              key={svc.id} 
                              onClick={() => setSelectedServiceId(svc.id)}
                              className={`p-5 rounded-lg border cursor-pointer transition-all ${
                                selectedServiceId === svc.id 
                                  ? 'border-plum bg-blush shadow-sm ring-1 ring-plum/20' 
                                  : 'border-border bg-white hover:border-plum/50 shadow-sm'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-grow">
                                  <h3 className="font-medium text-darktext text-lg">{svc.name}</h3>
                                  <p className="text-sm text-mutedtext mt-1">45 mins • Includes consultation</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="font-medium text-darktext block">₹{svc.price}</span>
                                  <div className={`mt-2 w-5 h-5 rounded-full border flex items-center justify-center ml-auto ${
                                    selectedServiceId === svc.id ? 'border-plum bg-plum' : 'border-border-dark bg-cream'
                                  }`}>
                                    {selectedServiceId === svc.id && <span className="w-2 h-2 bg-white rounded-full"></span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* REVIEWS */}
                {activeTab === 'reviews' && (
                  <div className="space-y-10 animate-in fade-in">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="bg-white p-6 rounded-lg border border-border shadow-sm text-center min-w-[200px]">
                        <div className="text-5xl font-serif text-darktext mb-2">{salon.rating}</div>
                        <div className="text-gold text-xl mb-1">★★★★★</div>
                        <div className="text-sm text-mutedtext">{salon.reviewsCount} verified reviews</div>
                      </div>

                      {/* AI Summary Block */}
                      <div className="bg-plum/5 border border-plum/10 p-6 rounded-lg flex-grow">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-semibold uppercase tracking-wider text-plum">Review Summary</span>
                        </div>
                        <p className="text-sm text-darktext leading-relaxed">
                          Customers consistently praise the professionalism of the staff and the hygienic environment. 
                          Wait times are generally short, though weekend afternoons can be busy. The {salon.services[0]?.name} is highly recommended by frequent visitors.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-darktext">Recent Customer Reviews</h3>
                      {[1, 2, 3].map(i => (
                        <div key={i} className="border-b border-border pb-6 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-cream rounded-full flex items-center justify-center text-sm font-medium text-darktext border border-border">
                                {String.fromCharCode(64 + i)}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-darktext">Verified Customer</p>
                                <p className="text-xs text-mutedtext">2 weeks ago</p>
                              </div>
                            </div>
                            <div className="text-gold text-sm">★★★★★</div>
                          </div>
                          <p className="text-sm text-darktext leading-relaxed mt-3">
                            Great experience overall. The staff was very attentive and the service quality was excellent. Will definitely be coming back.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 35% Sticky Booking Panel */}
            <div className="w-full lg:w-[35%] relative">
              <div className="sticky top-[100px] bg-white rounded-xl border border-border shadow-lg overflow-hidden">
                <div className="bg-plum p-6 text-warmwhite">
                  <h3 className="text-xl font-medium mb-1">Book an appointment</h3>
                  <p className="text-blush opacity-90 text-sm">Select a service to continue</p>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-sm font-medium text-mutedtext uppercase tracking-wider mb-3">Selected Service</p>
                    <div className="bg-cream border border-border p-4 rounded-lg flex justify-between items-center">
                      <span className="font-medium text-darktext">{selectedService?.name || 'Please select a service'}</span>
                      <span className="font-medium">₹{selectedService?.price || '0'}</span>
                    </div>
                    {!selectedServiceId && activeTab !== 'services' && (
                      <button 
                        onClick={() => setActiveTab('services')}
                        className="text-xs text-plum font-medium mt-2 hover:underline inline-block"
                      >
                        Change service
                      </button>
                    )}
                  </div>

                  <div className="border-t border-border pt-6 mb-6">
                    <div className="flex justify-between text-sm mb-2 text-mutedtext">
                      <span>Service fee</span>
                      <span>₹{selectedService?.price || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-4 text-mutedtext">
                      <span>Taxes & fees (18%)</span>
                      <span>₹{selectedService ? Math.round(selectedService.price * 0.18) : 0}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg text-darktext border-t border-border pt-4">
                      <span>Total</span>
                      <span>₹{selectedService ? Math.round(selectedService.price * 1.18) : 0}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleBook}
                    className="w-full bg-plum text-warmwhite py-4 rounded-lg font-medium hover:bg-plum-dark transition-colors shadow-sm text-lg"
                  >
                    Continue to Booking
                  </button>
                  <p className="text-center text-xs text-mutedtext mt-4">You won't be charged yet</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
