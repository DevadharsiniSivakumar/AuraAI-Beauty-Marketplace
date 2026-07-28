'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ClientConsoleLayout from '../components/ClientConsoleLayout';
import { useApp } from '../context/AppContext';
import { Sparkles, Star, MapPin, ThumbsUp, Activity, Check, AlertCircle } from 'lucide-react';

export default function ComparePage() {
  const { salons } = useApp();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aura_compare_ids');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedIds(parsed);
          } else {
            setSelectedIds([salons[0]?.id, salons[1]?.id].filter(Boolean));
          }
        } catch (e) {
          console.error(e);
          setSelectedIds([salons[0]?.id, salons[1]?.id].filter(Boolean));
        }
      } else {
        setSelectedIds([salons[0]?.id, salons[1]?.id].filter(Boolean));
      }
      setIsLoaded(true);
    }
  }, [salons]);

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('aura_compare_ids', JSON.stringify(selectedIds));
    }
  }, [selectedIds, isLoaded]);

  const { userProfile } = useApp();
  const [preferenceQuery, setPreferenceQuery] = useState('');
  const [comparing, setComparing] = useState(false);
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAiCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferenceQuery.trim() || compareSalons.length === 0) return;

    setComparing(true);
    setAiReport(null);
    setErrorMsg('');

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: preferenceQuery,
          salons: compareSalons,
          memoryContext: userProfile ? `User Location: ${userProfile.location || 'Bangalore'}. Face: ${userProfile.faceShape || ''}. Skin: ${userProfile.skinTone || ''}. Hair: ${userProfile.hairType || ''}. Budget: ${userProfile.preferredBudget || ''}` : ''
        })
      });

      if (!res.ok) {
        throw new Error('Failed to run AI comparison');
      }

      const data = await res.json();
      setAiReport(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to analyze compared salons.');
    } finally {
      setComparing(false);
    }
  };

  const compareSalons = selectedIds.map(id => salons.find(s => s.id === id)).filter(Boolean) as any[];

  return (
    <ClientConsoleLayout activeSidebarItem="compare" headerTitle="Compare Salons">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-in fade-in">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-darktext mb-2">Compare Salons</h1>
            <p className="text-mutedtext text-xs">Side-by-side analysis of your selected options.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
            <select
              onChange={(e) => {
                const id = e.target.value;
                if (id && !selectedIds.includes(id)) {
                  setSelectedIds(prev => [...prev, id]);
                }
                e.target.value = ''; // Reset dropdown selection
              }}
              className="bg-white border border-border text-darktext text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-plum shadow-xs cursor-pointer"
            >
              <option value="">+ Add Salon to Compare</option>
              {salons
                .filter(s => !selectedIds.includes(s.id))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.locality})</option>
                ))
              }
            </select>

            <Link 
              href="/salons" 
              className="text-xs font-bold bg-plum hover:bg-plum-dark text-warmwhite px-4 py-2.5 rounded-xl transition-all shadow-xs font-sans text-center"
            >
              Browse All Salons
            </Link>
          </div>
        </div>

        {/* AI Compare Preferences Section */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-xs mb-8 space-y-4">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-darktext text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-plum animate-pulse" />
              Aura AI Smart Comparison
            </h3>
            <p className="text-xs text-mutedtext">
              Type your personal preferences (e.g., budget range, specific skincare treatments, wedding preps) to let Aura AI analyze and pick the best match for you.
            </p>
          </div>

          <form onSubmit={handleAiCompare} className="space-y-4">
            <textarea
              value={preferenceQuery}
              onChange={(e) => setPreferenceQuery(e.target.value)}
              placeholder="e.g. I need a luxury bridal facial and nail art for my wedding, with excellent reviews and a budget under ₹6000..."
              className="w-full bg-cream border border-border text-darktext text-sm rounded-xl p-4 focus:outline-none focus:border-plum resize-none"
              rows={3}
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={comparing || compareSalons.length === 0}
                className="px-5 py-3 bg-plum text-warmwhite rounded-xl hover:bg-plum-dark text-xs font-bold transition-all disabled:opacity-50 disabled:bg-border cursor-pointer flex items-center gap-2"
              >
                {comparing ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-warmwhite border-t-transparent animate-spin"></div>
                    Running AI Comparison...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-peach animate-pulse" />
                    Compare with Aura AI
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Comparison Output Report */}
          {aiReport && (
            <div className="mt-6 border-t border-border pt-6 space-y-6 animate-in fade-in duration-300">
              {/* Highlight Recommendation */}
              <div className="p-5 bg-plum/5 border border-plum/10 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-plum text-warmwhite tracking-widest uppercase flex items-center gap-1.5 w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-peach animate-pulse" />
                  Aura's Pick
                </span>
                <h4 className="text-lg font-serif font-bold text-darktext mt-2">
                  {aiReport.recommendation.recommendedSalonName}
                </h4>
                <p className="text-xs text-mutedtext leading-relaxed font-light">
                  {aiReport.recommendation.reasonText}
                </p>
              </div>

              {/* Scorecard Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-darktext flex items-center gap-1.5 font-serif">
                    <Activity className="w-4 h-4 text-plum" />
                    Dynamic Scorecard
                  </h4>
                  <div className="space-y-3">
                    {(aiReport.feature1Comparison || []).map((item: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border border-border bg-cream/10 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="font-bold text-xs text-darktext">{item.salonName}</h5>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-peach/20 text-plum border border-peach/30 uppercase tracking-wider">
                            {item.aiRecommendationBadge}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10px] text-mutedtext pt-1">
                          <div>
                            <span className="font-semibold">Rating:</span> ★{item.rating}
                          </div>
                          <div>
                            <span className="font-semibold">Price:</span> {item.priceRange}
                          </div>
                          <div>
                            <span className="font-semibold">Reviews:</span> {item.reviewScore}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Insights */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-darktext flex items-center gap-1.5 font-serif">
                    <ThumbsUp className="w-4 h-4 text-plum" />
                    Review Sentiment Intelligence
                  </h4>
                  <div className="space-y-4">
                    {(aiReport.feature2ReviewIntelligence || []).map((item: any, idx: number) => (
                      <div key={idx} className="space-y-2 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                        <h5 className="font-bold text-xs text-darktext">{item.salonName} ({item.overallSentiment} Sentiment)</h5>
                        <div className="space-y-1">
                          <div className="flex items-start gap-1 text-[10px] text-sage font-medium">
                            <span className="text-xs">✓</span>
                            <span>Strengths: {item.topStrengths.join(', ')}</span>
                          </div>
                          {item.commonComplaints.length > 0 && (
                            <div className="flex items-start gap-1 text-[10px] text-rose font-medium">
                              <span className="text-xs">✕</span>
                              <span>Complaints: {item.commonComplaints.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose/10 border border-rose/20 text-rose text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errorMsg}
            </div>
          )}
        </div>

        {compareSalons.length > 0 ? (
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-6 border-b border-r border-border bg-warmwhite min-w-[150px] align-bottom">
                    <span className="text-sm font-medium text-mutedtext uppercase tracking-wider">Features</span>
                  </th>
                  {compareSalons.map(salon => (
                    <th key={salon.id} className="p-6 border-b border-border bg-warmwhite min-w-[250px] relative group">
                      <button 
                        onClick={() => setSelectedIds(prev => prev.filter(id => id !== salon.id))}
                        className="absolute top-4 right-4 text-mutedtext hover:text-rose opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-sage/20 border border-border rounded overflow-hidden"></div>
                        <div>
                          <h3 className="font-medium text-lg text-darktext">{salon.name}</h3>
                          <Link href={`/salons/${salon.id}`} className="text-xs text-plum hover:underline">View Profile</Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                
                {/* Rating */}
                <tr className="hover:bg-cream/50 transition-colors">
                  <td className="p-6 border-b border-r border-border font-medium text-darktext">Rating</td>
                  {compareSalons.map(salon => {
                    const isHighest = Math.max(...compareSalons.map(s => s.rating)) === salon.rating;
                    return (
                      <td key={salon.id} className={`p-6 border-b border-border ${isHighest ? 'bg-gold/5' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-gold">★</span>
                          <span className={`font-medium ${isHighest ? 'text-darktext' : 'text-mutedtext'}`}>{salon.rating}</span>
                          <span className="text-xs text-mutedtext">({salon.reviewsCount})</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Location */}
                <tr className="hover:bg-cream/50 transition-colors">
                  <td className="p-6 border-b border-r border-border font-medium text-darktext">Location</td>
                  {compareSalons.map(salon => (
                    <td key={salon.id} className="p-6 border-b border-border text-mutedtext">
                      {salon.location}
                    </td>
                  ))}
                </tr>

                {/* Price Range */}
                <tr className="hover:bg-cream/50 transition-colors">
                  <td className="p-6 border-b border-r border-border font-medium text-darktext">Avg. Price</td>
                  {compareSalons.map(salon => {
                    const avg = Math.round(salon.services.reduce((acc: number, cur: any) => acc + cur.price, 0) / salon.services.length);
                    const isLowest = Math.min(...compareSalons.map(s => Math.round(s.services.reduce((a: number, c: any) => a + c.price, 0) / s.services.length))) === avg;
                    return (
                      <td key={salon.id} className={`p-6 border-b border-border ${isLowest ? 'bg-sage/5' : ''}`}>
                        <span className={`font-medium ${isLowest ? 'text-sage' : 'text-darktext'}`}>₹{avg}</span>
                        <span className="text-xs text-mutedtext block mt-1">based on {salon.services.length} services</span>
                      </td>
                    );
                  })}
                </tr>

                {/* Top Services */}
                <tr className="hover:bg-cream/50 transition-colors">
                  <td className="p-6 border-b border-r border-border font-medium text-darktext">Top Services</td>
                  {compareSalons.map(salon => (
                    <td key={salon.id} className="p-6 border-b border-border align-top">
                      <ul className="space-y-2">
                        {salon.services.slice(0, 3).map((svc: any) => (
                          <li key={svc.id} className="text-mutedtext">
                            <span className="text-darktext">•</span> {svc.name}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Review Themes (Mocked) */}
                <tr className="hover:bg-cream/50 transition-colors">
                  <td className="p-6 border-b border-r border-border font-medium text-darktext">Review Themes</td>
                  {compareSalons.map((salon, i) => {
                    const themes = [
                      ['Highly professional', 'Clean environment', 'Punctual'],
                      ['Great ambiance', 'Premium products', 'Expensive'],
                      ['Friendly staff', 'Value for money', 'Busy on weekends']
                    ][i % 3];
                    return (
                      <td key={salon.id} className="p-6 border-b border-border align-top">
                        <div className="flex flex-wrap gap-2">
                          {themes.map(theme => (
                            <span key={theme} className="px-2 py-1 bg-cream border border-border rounded text-xs text-mutedtext">
                              {theme}
                            </span>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-6 border-r border-border"></td>
                  {compareSalons.map(salon => (
                    <td key={salon.id} className="p-6">
                      <Link 
                        href={`/booking?salon=${salon.id}&service=${salon.services[0]?.id}`}
                        className="block w-full py-3 bg-plum text-warmwhite text-center rounded-md font-medium hover:bg-plum-dark transition-colors shadow-sm"
                      >
                        Book Now
                      </Link>
                    </td>
                  ))}
                </tr>
                
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl p-12 text-center shadow-sm">
            <span className="text-4xl mb-4 block">⚖️</span>
            <h3 className="text-xl font-medium text-darktext mb-2">No salons added to compare</h3>
            <p className="text-mutedtext text-xs">Select salons from the explore list or the dropdown to see them compared side by side.</p>
          </div>
        )}
      </div>
    </ClientConsoleLayout>
  );
}
