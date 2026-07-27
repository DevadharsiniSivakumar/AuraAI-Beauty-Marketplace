'use client';

import React, { useState, useMemo, useEffect } from 'react';
import ClientConsoleLayout from '../components/ClientConsoleLayout';
import { useApp } from '../context/AppContext';
import { 
  Star, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  ThumbsUp, 
  MapPin
} from 'lucide-react';

export default function ReviewsPage() {
  const { salons, reviews, bookings, addReview } = useApp();

  const completedSalonIds = useMemo(() => {
    return new Set(bookings.filter(b => b.status === 'Completed').map(b => b.salonId));
  }, [bookings]);

  const allowedSalons = useMemo(() => {
    return salons.filter(s => completedSalonIds.has(s.id));
  }, [salons, completedSalonIds]);

  // Review form states
  const [selectedSalonId, setSelectedSalonId] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formTagsText, setFormTagsText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const salonParam = params.get('salon');
      if (salonParam && completedSalonIds.has(salonParam)) {
        setSelectedSalonId(salonParam);
      }
    }
  }, [completedSalonIds]);

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
    <ClientConsoleLayout activeSidebarItem="bookings" headerTitle="Review Intelligence">
      <div className="space-y-10 animate-in fade-in">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs bg-cream/10">
          <h1 className="text-3xl font-serif font-bold text-darktext">Review Intelligence</h1>
          <p className="text-xs text-mutedtext mt-1">Share your experiences and read consolidated feedback from our verified beauty communities.</p>
        </div>

        {/* Aggregate statistics layout & Review form */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Rating aggregate statistics card */}
          <div className="lg:col-span-1 p-6 rounded-2xl border border-border bg-white space-y-6 shadow-xs h-fit">
            <h3 className="font-bold text-darktext text-xs uppercase tracking-wider">Aura aggregates</h3>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <span className="text-4xl font-extrabold text-darktext block">{stats.avg}</span>
                <span className="text-[10px] text-mutedtext font-light block pt-0.5">out of 5</span>
              </div>
              <div>
                <div className="flex text-rosegold-500 mb-1">
                  {[...Array(Math.round(stats.avg))].map((_, i) => (
                    <Star key={i} className="w-4.5 h-4.5 fill-rosegold-500 text-rosegold-500" />
                  ))}
                </div>
                <span className="text-xs text-mutedtext">{stats.total} Verified Reviews</span>
              </div>
            </div>

            {/* Rating distribution progress bars */}
            <div className="space-y-2.5 pt-2">
              {stats.distPct.map((pct, idx) => {
                const starNum = 5 - idx;
                return (
                  <div key={idx} className="flex items-center text-xs text-darktext gap-3">
                    <span className="w-3 shrink-0 text-right">{starNum}★</span>
                    <div className="flex-1 bg-cream rounded-full h-2 overflow-hidden border border-border">
                      <div className="bg-plum h-full rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="w-8 shrink-0 text-right text-mutedtext font-light">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to submit a review */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-white shadow-xs space-y-5">
            <h3 className="text-lg font-serif font-bold text-darktext flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-plum" />
              Write a Review
            </h3>

            {allowedSalons.length === 0 ? (
              <div className="p-6 rounded-xl border border-amber-200/50 bg-amber-500/5 text-amber-900 space-y-2">
                <p className="font-semibold text-sm">Review Restrictions Active</p>
                <p className="text-xs font-light leading-relaxed">
                  To maintain marketplace integrity, you can only write a review for a salon after you have completed at least one appointment there. Visit the dashboard to view your booking history.
                </p>
              </div>
            ) : isSubmitted ? (
              <div className="p-6 rounded-xl border border-emerald-100 bg-emerald-500/5 text-center space-y-2 text-emerald-800">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                <p className="font-semibold text-sm">Review Submitted Successfully!</p>
                <p className="text-xs font-light text-emerald-700/80">Thank you for helping AuraAI grow smarter.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-mutedtext uppercase tracking-wider mb-2">Select Salon visited</label>
                    <select
                      value={selectedSalonId}
                      onChange={(e) => setSelectedSalonId(e.target.value)}
                      required
                      className="block w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-cream text-darktext focus:outline-none focus:border-plum"
                    >
                      <option value="" className="bg-cream text-darktext">-- Choose Salon --</option>
                      {allowedSalons.map(s => (
                        <option key={s.id} value={s.id} className="bg-cream text-darktext">{s.name} ({s.locality})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-mutedtext uppercase tracking-wider mb-2">Overall Rating</label>
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
                              star <= formRating ? 'fill-rosegold-500 text-rosegold-500' : 'text-cream-dark'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-mutedtext uppercase tracking-wider mb-2">Tags / Hashtags</label>
                  <input
                    type="text"
                    value={formTagsText}
                    onChange={(e) => setFormTagsText(e.target.value)}
                    placeholder="e.g. HydraFacial, Luxury, FastStyling (separate with commas)"
                    className="block w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-cream placeholder-mutedtext focus:outline-none focus:border-plum text-darktext"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-mutedtext uppercase tracking-wider mb-2">Detailed Feedback</label>
                  <textarea
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    required
                    rows={3}
                    placeholder="Write details on your experience, cleanliness, styling standards, or dermatologist consult..."
                    className="block w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-cream placeholder-mutedtext focus:outline-none focus:border-plum text-darktext"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-plum hover:bg-plum-dark text-warmwhite font-bold text-xs shadow-xs transition-all cursor-pointer"
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
          <h3 className="text-lg font-serif font-bold text-darktext border-b border-border pb-2">Recent Client Feedback</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev: any, idx: number) => (
              <div 
                key={rev.id || idx}
                className="p-5 rounded-2xl border border-border bg-white shadow-xs hover:border-plum/20 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-darktext">{rev.author}</h4>
                      <span className="text-[10px] text-mutedtext flex items-center gap-1 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-mutedtext shrink-0" />
                        {rev.salonName}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <div className="flex text-rosegold-500 mr-1.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-rosegold-500" />
                        ))}
                      </div>
                      <span className="text-[10px] text-mutedtext">{rev.date}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-mutedtext leading-relaxed font-light italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <div className="flex gap-1.5">
                    {rev.tags && rev.tags.map((tag: string) => (
                      <span key={tag} className="text-[9px] font-semibold text-plum px-2 py-0.5 rounded-full bg-plum/5">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button className="text-[10px] font-semibold text-mutedtext hover:text-plum flex items-center gap-1 cursor-pointer">
                    <ThumbsUp className="w-3 h-3" />
                    Helpful
                  </button>
                </div>

              </div>
            ))}
          </div>
        </section>

      </div>
    </ClientConsoleLayout>
  );
}
