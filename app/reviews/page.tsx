'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { 
  Star, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  ThumbsUp, 
  SlidersHorizontal,
  MapPin
} from 'lucide-react';

export default function ReviewsPage() {
  const { salons, reviews, addReview } = useApp();

  // Review form states
  const [selectedSalonId, setSelectedSalonId] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formTagsText, setFormTagsText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalonId || !formComment) return;

    // Parse tags (split by comma or whitespace)
    const tags = formTagsText
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => t.startsWith('#') ? t : `#${t}`);

    addReview(selectedSalonId, formRating, formComment, tags);
    
    setIsSubmitted(true);
    // Reset inputs
    setSelectedSalonId('');
    setFormRating(5);
    setFormComment('');
    setFormTagsText('');

    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  // Calculate rating stats
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, total: 0, distPct: [0, 0, 0, 0, 0] };
    const total = reviews.length;
    const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    const avg = parseFloat((sum / total).toFixed(1));

    const dist = [0, 0, 0, 0, 0]; // 1-star to 5-star
    reviews.forEach((r: any) => {
      if (r.rating >= 1 && r.rating <= 5) {
        dist[r.rating - 1]++;
      }
    });

    // Percentages
    const distPct = dist.map(count => Math.round((count / total) * 100)).reverse(); // 5-star down to 1-star

    return { avg, total, distPct };
  }, [reviews]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-950 dark:text-white">Review Intelligence</h1>
          <p className="text-sm text-charcoal-550 dark:text-rosegold-200">Share your experiences and read consolidated feedback from our verified beauty communities.</p>
        </div>

        {/* Aggregate statistics layout & Review form */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Rating aggregate statistics card */}
          <div className="lg:col-span-1 p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-6 shadow-2xs h-fit">
            <h3 className="font-bold text-charcoal-900 dark:text-white text-sm uppercase tracking-wider">Aura aggregates</h3>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-extrabold text-charcoal-950 dark:text-white block">{stats.avg}</span>
                <span className="text-[10px] text-charcoal-400 font-light block pt-0.5">out of 5</span>
              </div>
              <div>
                <div className="flex text-rosegold-500 mb-1">
                  {[...Array(Math.round(stats.avg))].map((_, i) => (
                    <Star key={i} className="w-4.5 h-4.5 fill-rosegold-500" />
                  ))}
                </div>
                <span className="text-xs text-charcoal-500">{stats.total} Verified Reviews</span>
              </div>
            </div>

            {/* Rating distribution progress bars */}
            <div className="space-y-2.5 pt-2">
              {stats.distPct.map((pct, idx) => {
                const starNum = 5 - idx;
                return (
                  <div key={idx} className="flex items-center text-xs text-charcoal-600 dark:text-rosegold-200 gap-3">
                    <span className="w-3 shrink-0 text-right">{starNum}★</span>
                    <div className="flex-1 bg-rosegold-100/40 dark:bg-charcoal-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-rosegold-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="w-8 shrink-0 text-right text-charcoal-400 font-light">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to submit a review */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 shadow-xs space-y-5">
            <h3 className="text-lg font-bold text-charcoal-950 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rosegold-555" />
              Write a Review
            </h3>

            {isSubmitted ? (
              <div className="p-6 rounded-xl border border-emerald-100 dark:border-emerald-950/50 bg-emerald-50/10 dark:bg-emerald-950/20 text-center space-y-2 text-emerald-800 dark:text-emerald-350">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="font-semibold text-sm">Review Submitted Successfully!</p>
                <p className="text-xs font-light text-emerald-700/80 dark:text-emerald-400">Thank you for helping AuraAI grow smarter.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Select Salon visited</label>
                    <select
                      value={selectedSalonId}
                      onChange={(e) => setSelectedSalonId(e.target.value)}
                      required
                      className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
                    >
                      <option value="">-- Choose Salon --</option>
                      {salons.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.locality})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Overall Rating</label>
                    <div className="flex space-x-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          className="text-rosegold-500 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              star <= formRating ? 'fill-rosegold-500 text-rosegold-500' : 'text-rosegold-200'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Tags / Hashtags</label>
                  <input
                    type="text"
                    value={formTagsText}
                    onChange={(e) => setFormTagsText(e.target.value)}
                    placeholder="e.g. HydraFacial, Luxury, FastStyling (separate with commas)"
                    className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 placeholder-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Detailed Feedback</label>
                  <textarea
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    required
                    rows={3}
                    placeholder="Write details on your experience, cleanliness, styling standards, or dermatologist consult..."
                    className="block w-full px-3 py-2.5 text-sm rounded-xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 placeholder-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-rosegold-500 text-charcoal-900 dark:text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-linear-to-r from-rosegold-500 to-gold-metallic text-white font-semibold text-xs shadow-xs hover:scale-102 hover:shadow-md transition-all cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}

          </div>

        </section>

        {/* Global reviews feed list */}
        <section className="space-y-6">
          <h3 className="text-lg font-bold text-charcoal-950 dark:text-white border-b border-rosegold-100 dark:border-charcoal-800 pb-2">Recent Client Feedback</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev: any, idx: number) => (
              <div 
                key={rev.id || idx}
                className="p-5 rounded-2xl border border-rosegold-200/50 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 shadow-2xs hover:border-rosegold-300 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-charcoal-900 dark:text-white">{rev.author}</h4>
                      <span className="text-[10px] text-charcoal-400 flex items-center gap-1 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rosegold-550 shrink-0" />
                        {rev.salonName}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <div className="flex text-rosegold-500 mr-1.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-rosegold-500" />
                        ))}
                      </div>
                      <span className="text-[10px] text-charcoal-400">{rev.date}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-charcoal-600 dark:text-rosegold-200 leading-relaxed font-light italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-rosegold-100 dark:border-charcoal-800/80">
                  <div className="flex gap-1.5">
                    {rev.tags && rev.tags.map((tag: string) => (
                      <span key={tag} className="text-[9px] font-semibold text-rosegold-500 px-2 py-0.5 rounded-full bg-rosegold-50 dark:bg-charcoal-950">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button className="text-[10px] font-semibold text-charcoal-400 hover:text-rosegold-500 flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    Helpful
                  </button>
                </div>

              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
