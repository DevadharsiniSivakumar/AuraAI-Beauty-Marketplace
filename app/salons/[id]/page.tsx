'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useApp } from '../../context/AppContext';
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft,
  Calendar,
  Heart,
  Share2,
  Bookmark,
  ChevronRight,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

export default function SalonDetails() {
  const params = useParams();
  const router = useRouter();
  const { salons } = useApp();
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'about'>('services');
  const [isSaved, setIsSaved] = useState(false);

  const id = params.id as string;
  const salon = salons.find(s => s.id === id);

  if (!salon) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <h2 className="text-2xl font-bold font-playfair">Salon Not Found</h2>
          <p className="text-charcoal-400">The requested salon profile does not exist.</p>
          <Link href="/salons" className="px-6 py-2 rounded-full bg-rosegold-500 text-white font-semibold text-xs cursor-pointer">
            Back to Directory
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const servicesList = salon.services || [];
  const reviewsList = salon.reviews || [];
  const galleryList = salon.gallery || [salon.image];

  // Group services by category
  const categories = Array.from(new Set(servicesList.map(s => s.category)));
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || 'Hair');

  const filteredServices = servicesList.filter(s => s.category === selectedCategory);

  // V2 Similar Salons logic: find alternative salons matching location or luxury tags
  const similarSalons = salons
    .filter(s => s.id !== salon.id)
    .filter(s => s.locality === salon.locality || s.isLuxury === salon.isLuxury)
    .slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Back navigation & Quick Actions */}
        <div className="flex justify-between items-center">
          <Link href="/salons" className="inline-flex items-center text-xs font-semibold text-charcoal-600 dark:text-rosegold-200 hover:text-rosegold-550">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Salons
          </Link>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2 rounded-xl border border-rosegold-200 dark:border-charcoal-800 transition-colors cursor-pointer ${
                isSaved ? 'text-rosegold-555 bg-rosegold-50/50 dark:bg-charcoal-900' : 'text-charcoal-600 dark:text-rosegold-100 hover:bg-rosegold-50'
              }`}
              title="Save Salon"
            >
              <Bookmark className={`w-4.5 h-4.5 ${isSaved ? 'fill-rosegold-500' : ''}`} />
            </button>
            <button 
              className="p-2 rounded-xl border border-rosegold-200 dark:border-charcoal-800 text-charcoal-600 dark:text-rosegold-100 hover:bg-rosegold-50 transition-colors cursor-pointer"
              title="Share Profile"
            >
              <Share2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[280px] sm:h-[400px]">
          {/* Main Large Image */}
          <div className="md:col-span-2 rounded-2xl overflow-hidden relative border border-rosegold-200/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={galleryList[0] || salon.image} 
              alt={salon.name} 
              className="w-full h-full object-cover hover:scale-101 transition-transform duration-500" 
            />
          </div>
          {/* Smaller images right */}
          <div className="hidden md:flex flex-col gap-4">
            <div className="flex-1 rounded-2xl overflow-hidden relative border border-rosegold-200/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={galleryList[1] || galleryList[0] || salon.image} 
                alt={`${salon.name} Gallery 2`} 
                className="w-full h-full object-cover hover:scale-101 transition-transform duration-500" 
              />
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden relative border border-rosegold-200/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={galleryList[2] || galleryList[0] || salon.image} 
                alt={`${salon.name} Gallery 3`} 
                className="w-full h-full object-cover hover:scale-101 transition-transform duration-500" 
              />
            </div>
          </div>
        </section>

        {/* Title, Metrics & Address Section */}
        <section className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-rosegold-200/40 dark:border-charcoal-800 pb-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-charcoal-950 dark:text-white font-playfair">{salon.name}</h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-linear-to-r from-rosegold-550 to-gold-metallic text-white">
                {salon.matchScore}% Match
              </span>
              {salon.isLuxury && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-linear-to-tr from-charcoal-900 to-charcoal-950 text-rosegold-200 tracking-widest uppercase shadow-sm flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Luxury Flagship
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-charcoal-555 dark:text-rosegold-255 flex items-center">
              <MapPin className="w-4.5 h-4.5 text-rosegold-500 mr-1.5 shrink-0" />
              {salon.address}
            </p>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center text-rosegold-500">
                <Star className="w-4.5 h-4.5 fill-rosegold-500 mr-1" />
                <span className="font-bold">{salon.rating}</span>
                <span className="text-xs text-charcoal-450 ml-1">({salon.reviewsCount || reviewsList.length} verified reviews)</span>
              </div>
              {salon.status === 'Closed' ? (
                <span className="text-xs text-red-650 font-semibold bg-red-100/55 dark:bg-red-950/40 px-2.5 py-0.5 rounded-full flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Closed Today
                </span>
              ) : salon.status === 'Temporarily Unavailable' ? (
                <span className="text-xs text-amber-700 font-semibold bg-amber-100/55 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Temporarily Unavailable
                </span>
              ) : (
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-100/55 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Open Today (9:00 AM - 8:30 PM)
                </span>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto p-4 rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-rosegold-50/10 dark:bg-charcoal-950/20 shrink-0 space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-charcoal-400">Quick Connect</h4>
            <div className="flex flex-col space-y-1.5 text-xs text-charcoal-600 dark:text-rosegold-100 font-mono">
              <span className="flex items-center gap-1.5 font-sans">
                <Phone className="w-3.5 h-3.5 text-rosegold-500" />
                {salon.phone}
              </span>
              <span className="flex items-center gap-1.5 font-sans">
                <Clock className="w-3.5 h-3.5 text-rosegold-500" />
                Tue - Sun: 9 AM - 9 PM
              </span>
            </div>
          </div>
        </section>

        {/* Content Layout - Tabs Selector on Left, AI Summarizer on Right */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs Trigger */}
            <div className="flex border-b border-rosegold-150 dark:border-charcoal-800">
              {(['services', 'reviews', 'about'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === tab 
                      ? 'border-rosegold-500 text-rosegold-600 dark:text-gold-medium' 
                      : 'border-transparent text-charcoal-500 dark:text-rosegold-300 hover:text-rosegold-500'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content rendering */}
            <div className="space-y-6">
              
              {/* SERVICES TAB */}
              {activeTab === 'services' && (
                <div className="space-y-6 animate-fade-in">
                  {categories.length > 0 ? (
                    <>
                      {/* Category Pill Sub-Navigation */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`text-xs px-4 py-2 rounded-full border transition-all shrink-0 cursor-pointer ${
                              selectedCategory === cat 
                                ? 'bg-rosegold-500 border-rosegold-500 text-white font-semibold' 
                                : 'border-rosegold-200 dark:border-charcoal-800 text-charcoal-600 dark:text-rosegold-100 hover:bg-rosegold-50'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Services Row Grid */}
                      <div className="space-y-4">
                        {filteredServices.map((service) => (
                          <div 
                            key={service.id}
                            className="p-4 rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-white dark:bg-charcoal-900/60 flex justify-between items-center gap-4 hover:border-rosegold-300 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-charcoal-900 dark:text-white text-sm sm:text-base">{service.name}</h4>
                                {service.isActive === false && (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-400 dark:text-charcoal-500 uppercase tracking-wider">
                                    Unavailable
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-charcoal-450 dark:text-rosegold-350 font-light leading-relaxed max-w-lg">
                                {service.description}
                              </p>
                              <span className="text-[10px] text-charcoal-400 block pt-1">
                                Duration: {service.duration}
                              </span>
                            </div>
                            <div className="flex flex-col items-end shrink-0 gap-2">
                              <span className="text-sm font-bold text-charcoal-900 dark:text-white font-mono">₹{service.price}</span>
                              {service.isActive !== false && salon.status !== 'Closed' && salon.status !== 'Temporarily Unavailable' ? (
                                <Link
                                  href={`/booking?salon=${salon.id}&service=${service.id}`}
                                  className="px-4 py-1.5 rounded-lg bg-rosegold-500 hover:bg-rosegold-600 text-xs font-bold text-white flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  Book
                                </Link>
                              ) : (
                                <span className="px-4 py-1.5 rounded-lg bg-charcoal-200 dark:bg-charcoal-800 text-xs font-bold text-charcoal-400 dark:text-charcoal-500 flex items-center gap-1 cursor-not-allowed select-none">
                                  Unavailable
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 border border-dashed border-rosegold-200 dark:border-charcoal-800 rounded-2xl">
                      <p className="text-xs text-charcoal-400">No services catalog logs found for this outlet yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center pb-2 border-b border-rosegold-100 dark:border-charcoal-800/80">
                    <h3 className="text-sm font-bold text-charcoal-800 dark:text-white uppercase tracking-wider">User Reviews</h3>
                    <Link
                      href={`/reviews?salon=${salon.id}`}
                      className="text-xs font-semibold text-rosegold-500 hover:text-rosegold-650 flex items-center cursor-pointer"
                    >
                      Write Review
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                  </div>

                  {reviewsList.length > 0 ? (
                    <div className="space-y-4">
                      {reviewsList.map((rev) => (
                        <div key={rev.id} className="p-4 rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-white dark:bg-charcoal-900/60 space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-full bg-rosegold-100 dark:bg-charcoal-800 text-rosegold-550 flex items-center justify-center font-bold text-xs">
                                {rev.author[0]}
                              </div>
                              <span className="text-xs font-bold text-charcoal-900 dark:text-white">{rev.author}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-charcoal-400 font-light">{rev.date}</span>
                              <div className="flex text-rosegold-500">
                                {[...Array(rev.rating)].map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-rosegold-500" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-charcoal-600 dark:text-rosegold-200 leading-relaxed font-light italic">
                            &ldquo;{rev.comment}&rdquo;
                          </p>
                          {rev.tags && rev.tags.length > 0 && (
                            <div className="flex gap-1.5 pt-1">
                              {rev.tags.map(tag => (
                                <span key={tag} className="text-[9px] font-semibold text-rosegold-500 px-2 py-0.5 rounded-full bg-rosegold-50 dark:bg-charcoal-950">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed border-rosegold-200 dark:border-charcoal-800 rounded-2xl">
                      <p className="text-xs text-charcoal-400">Be the first to write a review for this flagship!</p>
                    </div>
                  )}
                </div>
              )}

              {/* ABOUT TAB */}
              {activeTab === 'about' && (
                <div className="p-6 rounded-2xl border border-rosegold-150 dark:border-charcoal-800 bg-white dark:bg-charcoal-900/60 space-y-4 animate-fade-in">
                  <h3 className="font-bold text-charcoal-950 dark:text-white text-base font-playfair">About {salon.name}</h3>
                  <p className="text-sm text-charcoal-600 dark:text-rosegold-200 leading-relaxed font-light">
                    {salon.description}
                  </p>
                  
                  <div className="pt-4 border-t border-rosegold-100 dark:border-charcoal-800/80 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-400">Amenities Offered</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-charcoal-650 dark:text-rosegold-155">
                      <span>✓ WiFi Available</span>
                      <span>✓ Complimentary Jasmine Tea / Coffee</span>
                      <span>✓ Air Conditioned Cabinets</span>
                      <span>✓ Disposable Grooming Sheets</span>
                      <span>✓ Certified Dermatologist Consult</span>
                      <span>✓ Digital Payment Accepted</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Right Sidebar - AI Review Summary Card & V2 Popular Services */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* AI Summary block */}
            <div className="p-6 rounded-2xl border border-rosegold-350 dark:border-charcoal-800 bg-linear-to-b from-rosegold-100/20 to-white dark:from-charcoal-900 dark:to-charcoal-950 space-y-5 shadow-sm">
              <div className="flex items-center space-x-2 text-rosegold-600 dark:text-gold-medium">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold tracking-wide text-xs uppercase">Aura AI Review Intel</h3>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-charcoal-750 dark:text-rosegold-200">
                <p className="font-light italic bg-white/60 dark:bg-charcoal-950/50 p-3.5 rounded-xl border border-rosegold-100 dark:border-charcoal-900">
                  {salon.aiReviewSummary?.summary || 'AI concierge intelligence is currently scanning customer moderation feeds...'}
                </p>

                {/* Popular Services Section (V2 added) */}
                {salon.aiReviewSummary?.popularServices && salon.aiReviewSummary.popularServices.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="font-bold text-charcoal-800 dark:text-white uppercase tracking-wider text-[10px]">Popular Services</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {salon.aiReviewSummary.popularServices.map((popS, pIdx) => (
                        <span key={pIdx} className="text-[9px] font-semibold text-rosegold-550 bg-rosegold-100/40 dark:bg-charcoal-800 px-2 py-0.5 rounded-md">
                          {popS}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pros List */}
                {salon.aiReviewSummary?.pros && salon.aiReviewSummary.pros.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-350">Pros:</h4>
                    <ul className="space-y-1 pl-3 list-disc">
                      {salon.aiReviewSummary.pros.map((pro, idx) => (
                        <li key={idx} className="font-light text-charcoal-600 dark:text-rosegold-200">{pro}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cons List */}
                {salon.aiReviewSummary?.cons && salon.aiReviewSummary.cons.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-355">Cons:</h4>
                    <ul className="space-y-1 pl-3 list-disc">
                      {salon.aiReviewSummary.cons.map((con, idx) => (
                        <li key={idx} className="font-light text-charcoal-650 dark:text-rosegold-200">{con}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-rosegold-100 dark:border-charcoal-800 text-center">
                <span className="text-[10px] text-charcoal-400 font-light flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-rosegold-550" />
                  Verified aggregate extraction
                </span>
              </div>
            </div>

            {/* Quick Actions / Loyalty point preview card */}
            <div className="p-5 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900/60 text-center space-y-3 shadow-2xs">
              <h4 className="text-xs font-bold text-charcoal-900 dark:text-white uppercase tracking-wider">Book With Confidence</h4>
              <p className="text-xs text-charcoal-400 font-light leading-relaxed">
                Receive booking reminders, digital invoices, and secure cancellation options via your dashboard.
              </p>
            </div>

          </aside>

        </section>

        {/* SECTION: Similar Salons (V2 added) */}
        {similarSalons.length > 0 && (
          <section className="space-y-4 pt-6">
            <div className="border-b border-rosegold-200/40 pb-2">
              <h3 className="text-lg font-bold text-charcoal-950 dark:text-white flex items-center gap-2 font-playfair">
                <TrendingUp className="w-5 h-5 text-rosegold-550" />
                Similar Salons You May Like
              </h3>
              <p className="text-xs text-charcoal-450 dark:text-rosegold-250">Alternative high-matching salons located nearby or matching this brand standard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {similarSalons.map((simSalon) => {
                const simServices = simSalon.services || [];
                const startingPrice = simServices.length > 0 
                  ? Math.min(...simServices.map(s => s.price)) 
                  : 0;
                return (
                  <div 
                    key={simSalon.id}
                    className="p-4 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-rosegold-300 transition-colors shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-linear-to-r from-rosegold-500 to-gold-metallic text-white">
                          {simSalon.matchScore}% Match
                        </span>
                        <div className="flex text-rosegold-500 text-xs items-center font-bold">
                          <Star className="w-3 h-3 fill-rosegold-500 mr-0.5" />
                          {simSalon.rating}
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-charcoal-900 dark:text-white">{simSalon.name}</h4>
                      <p className="text-xs text-charcoal-400 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-rosegold-550" />
                        {simSalon.location}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start w-full sm:w-auto shrink-0 gap-2 pt-2 sm:pt-0">
                      <span className="text-xs text-charcoal-550">
                        {startingPrice > 0 ? `Starts from ₹${startingPrice}` : 'N/A'}
                      </span>
                      <Link
                        href={`/salons/${simSalon.id}`}
                        className="px-4 py-2 rounded-xl bg-rosegold-500 hover:bg-rosegold-650 text-xs font-bold text-white flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        View Profile
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
