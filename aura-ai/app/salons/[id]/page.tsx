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
  Share2,
  Bookmark,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function SalonDetails() {
  const params = useParams();
  const router = useRouter();
  const { salons, userProfile, updateProfile } = useApp();
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'about'>('services');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const id = params.id as string;
  const salon = salons.find(s => s.id === id);

  const isSaved = userProfile?.favoriteSalons?.includes(id) || false;

  const toggleSave = () => {
    if (!userProfile) return;
    const currentFavs = userProfile.favoriteSalons || [];
    let updatedFavorites;
    if (isSaved) {
      updatedFavorites = currentFavs.filter(favId => favId !== id);
    } else {
      updatedFavorites = [...currentFavs, id];
    }
    updateProfile({ favoriteSalons: updatedFavorites });
  };

  if (!salon) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <h2 className="text-2xl font-bold">Salon Not Found</h2>
          <p className="text-gray-500">The requested salon profile does not exist.</p>
          <Link href="/salons" className="px-6 py-2 rounded-md bg-gray-900 text-white dark:bg-white dark:text-black font-semibold text-sm">
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
  const activeCategory = selectedCategory || categories[0] || 'Hair';

  const filteredServices = servicesList.filter(s => s.category === activeCategory);

  // Similar Salons logic
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
          <Link href="/salons" className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Salons
          </Link>

          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleSave}
              className={`p-2 rounded-md border border-gray-300 dark:border-gray-700 transition-colors ${
                isSaved ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              title="Save Salon"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-gray-900 dark:fill-white' : ''}`} />
            </button>
            <button 
              className="p-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[280px] sm:h-[400px]">
          {/* Main Large Image */}
          <div className="md:col-span-2 bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden border border-gray-200 dark:border-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={galleryList[0] || salon.image} 
              alt={salon.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          {/* Smaller images right */}
          <div className="hidden md:flex flex-col gap-4">
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden border border-gray-200 dark:border-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={galleryList[1] || galleryList[0] || salon.image} 
                alt={`${salon.name} Gallery 2`} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden border border-gray-200 dark:border-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={galleryList[2] || galleryList[0] || salon.image} 
                alt={`${salon.name} Gallery 3`} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </section>

        {/* Title, Metrics & Address Section */}
        <section className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{salon.name}</h1>
              <span className="text-xs font-bold px-2.5 py-1 rounded-sm bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                {salon.matchScore}% Match
              </span>
              {salon.isLuxury && (
                <span className="text-xs font-bold px-2 py-1 rounded-sm border border-gray-900 dark:border-white text-gray-900 dark:text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Luxury
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <MapPin className="w-4 h-4 text-gray-400 mr-1 shrink-0" />
              {salon.address}
            </p>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="font-bold text-gray-900 dark:text-white">{salon.rating}</span>
                <span className="text-gray-500 ml-1">({salon.reviewsCount || reviewsList.length} reviews)</span>
              </div>
              {salon.status === 'Closed' ? (
                <span className="text-sm text-red-600 font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Closed Today
                </span>
              ) : salon.status === 'Temporarily Unavailable' ? (
                <span className="text-sm text-amber-600 font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Temporarily Unavailable
                </span>
              ) : (
                <span className="text-sm text-green-600 font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Open Today (9:00 AM - 8:30 PM)
                </span>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto p-4 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-md shrink-0 space-y-2">
            <h4 className="text-xs font-semibold uppercase text-gray-500">Contact</h4>
            <div className="flex flex-col space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                {salon.phone}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
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
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              {(['services', 'reviews', 'about'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center uppercase tracking-wider transition-colors ${
                    activeTab === tab 
                      ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' 
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
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
                <div className="space-y-6">
                  {categories.length > 0 ? (
                    <>
                      {/* Category Pill Sub-Navigation */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`text-sm px-4 py-2 border rounded-md transition-colors shrink-0 ${
                              activeCategory === cat 
                                ? 'bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900 font-medium' 
                                : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
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
                            className="p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black rounded-md flex justify-between items-center gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900 dark:text-white text-base">{service.name}</h4>
                                {service.isActive === false && (
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-gray-100 text-gray-500 dark:bg-gray-800">
                                    Unavailable
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg">
                                {service.description}
                              </p>
                              <span className="text-xs text-gray-500 block pt-1">
                                Duration: {service.duration}
                              </span>
                            </div>
                            <div className="flex flex-col items-end shrink-0 gap-2">
                              <span className="text-base font-bold text-gray-900 dark:text-white">₹{service.price}</span>
                              {service.isActive !== false && salon.status !== 'Closed' && salon.status !== 'Temporarily Unavailable' ? (
                                <Link
                                  href={`/booking?salon=${salon.id}&service=${service.id}`}
                                  className="px-4 py-2 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium flex items-center gap-1"
                                >
                                  <Calendar className="w-4 h-4" />
                                  Book
                                </Link>
                              ) : (
                                <span className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800 text-sm font-medium text-gray-500 flex items-center gap-1 cursor-not-allowed">
                                  Unavailable
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900">
                      <p className="text-sm text-gray-500">No services found for this salon.</p>
                    </div>
                  )}
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">User Reviews</h3>
                    <Link
                      href={`/reviews?salon=${salon.id}`}
                      className="text-sm font-medium text-gray-900 dark:text-white flex items-center hover:underline"
                    >
                      Write Review
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>

                  {reviewsList.length > 0 ? (
                    <div className="space-y-4">
                      {reviewsList.map((rev) => (
                        <div key={rev.id} className="p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black rounded-md space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold text-sm">
                                {rev.author[0]}
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{rev.author}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-500">{rev.date}</span>
                              <div className="flex text-yellow-500">
                                {[...Array(rev.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-500" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            &ldquo;{rev.comment}&rdquo;
                          </p>
                          {rev.tags && rev.tags.length > 0 && (
                            <div className="flex gap-2 pt-2">
                              {rev.tags.map(tag => (
                                <span key={tag} className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2 py-1 rounded-sm bg-gray-100 dark:bg-gray-800">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900">
                      <p className="text-sm text-gray-500">Be the first to write a review for this salon!</p>
                    </div>
                  )}
                </div>
              )}

              {/* ABOUT TAB */}
              {activeTab === 'about' && (
                <div className="p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black rounded-md space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">About {salon.name}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {salon.description}
                  </p>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    <h4 className="text-sm font-bold uppercase text-gray-500">Amenities Offered</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span>✓ WiFi Available</span>
                      <span>✓ Complimentary Beverages</span>
                      <span>✓ Air Conditioned</span>
                      <span>✓ Professional Staff</span>
                      <span>✓ Walk-ins Welcome</span>
                      <span>✓ Digital Payment</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Sidebar - AI Review Summary Card & V2 Popular Services */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* AI Summary block */}
            <div className="p-6 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-md space-y-4">
              <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold tracking-wider text-sm uppercase">AI Review Summary</h3>
              </div>

              <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <p className="bg-white dark:bg-black p-4 rounded-md border border-gray-200 dark:border-gray-800">
                  {salon.aiReviewSummary?.summary || 'AI review summary is currently being generated...'}
                </p>

                {/* Popular Services Section */}
                {salon.aiReviewSummary?.popularServices && salon.aiReviewSummary.popularServices.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">Popular Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {salon.aiReviewSummary.popularServices.map((popS, pIdx) => (
                        <span key={pIdx} className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-sm">
                          {popS}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pros List */}
                {salon.aiReviewSummary?.pros && salon.aiReviewSummary.pros.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="font-semibold text-green-700 dark:text-green-500">Pros:</h4>
                    <ul className="space-y-1 pl-4 list-disc">
                      {salon.aiReviewSummary.pros.map((pro, idx) => (
                        <li key={idx} className="text-gray-700 dark:text-gray-300">{pro}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cons List */}
                {salon.aiReviewSummary?.cons && salon.aiReviewSummary.cons.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-700 dark:text-red-500">Cons:</h4>
                    <ul className="space-y-1 pl-4 list-disc">
                      {salon.aiReviewSummary.cons.map((con, idx) => (
                        <li key={idx} className="text-gray-700 dark:text-gray-300">{con}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
                <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Review Analysis
                </span>
              </div>
            </div>
          </aside>

        </section>

        {/* SECTION: Similar Salons */}
        {similarSalons.length > 0 && (
          <section className="space-y-4 pt-8">
            <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                Similar Salons
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Other salons you might like based on your current selection.</p>
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
                    className="p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-1 rounded-sm bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                          {simSalon.matchScore}% Match
                        </span>
                        <div className="flex text-yellow-500 text-sm items-center font-medium">
                          <Star className="w-4 h-4 fill-yellow-500 mr-1" />
                          {simSalon.rating}
                        </div>
                      </div>
                      <h4 className="font-bold text-base text-gray-900 dark:text-white">{simSalon.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {simSalon.location}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto shrink-0 gap-2 mt-2 sm:mt-0">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {startingPrice > 0 ? `Starts from ₹${startingPrice}` : 'N/A'}
                      </span>
                      <Link
                        href={`/salons/${simSalon.id}`}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        View Profile
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
