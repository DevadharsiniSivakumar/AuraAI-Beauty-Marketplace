'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function JourneyPage() {
  const [eventType, setEventType] = useState('Wedding');
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState('premium');
  const [preferences, setPreferences] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Simulate API call for the planner
    setTimeout(() => {
      setPlan({
        title: `${eventType} Beauty Journey`,
        phases: [
          {
            title: '4 Weeks Before',
            color: 'bg-plum',
            bgLight: 'bg-plum/10',
            tasks: [
              { name: 'Deep Cleansing Facial', type: 'Skin', price: '₹2,500', id: 's2' },
              { name: 'Hair Color Consultation', type: 'Hair', price: 'Free', id: 's1' }
            ]
          },
          {
            title: '2 Weeks Before',
            color: 'bg-sage',
            bgLight: 'bg-sage/10',
            tasks: [
              { name: 'Hair Trim & Spa', type: 'Hair', price: '₹1,800', id: 's1' },
              { name: 'Hydrating Body Wrap', type: 'Spa', price: '₹3,000', id: 's4' }
            ]
          },
          {
            title: '1 Week Before',
            color: 'bg-coral',
            bgLight: 'bg-coral/10',
            tasks: [
              { name: 'Bridal Glow Facial', type: 'Skin', price: '₹3,500', id: 's2' }
            ]
          },
          {
            title: 'Final 48 Hours',
            color: 'bg-lavender',
            bgLight: 'bg-lavender/10',
            tasks: [
              { name: 'Luxury Manicure & Pedicure', type: 'Nails', price: '₹2,000', id: 's5' },
              { name: 'Eyebrow Threading', type: 'Face', price: '₹200', id: 's2' }
            ]
          },
          {
            title: 'Event Day',
            color: 'bg-rose',
            bgLight: 'bg-rose/10',
            tasks: [
              { name: 'Professional Makeup & Styling', type: 'Bridal', price: '₹12,000', id: 's3' }
            ]
          }
        ]
      });
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-darktext mb-2">Beauty Journey Planner</h1>
          <p className="text-mutedtext">Generate a personalized timeline of treatments for your special event.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left: Setup Form */}
          <div className="w-full lg:w-[40%]">
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
              <h2 className="text-xl font-medium text-darktext mb-6">Event Details</h2>
              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-mutedtext mb-1">Event Type</label>
                  <select 
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full p-3 bg-cream border border-border rounded-lg text-darktext focus:outline-none focus:border-plum"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Engagement">Engagement / Roka</option>
                    <option value="Party">Special Party</option>
                    <option value="Photoshoot">Photoshoot</option>
                    <option value="Vacation">Vacation Prep</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-mutedtext mb-1">Event Date</label>
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 bg-cream border border-border rounded-lg text-darktext focus:outline-none focus:border-plum"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-mutedtext mb-1">Budget Tier</label>
                  <select 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full p-3 bg-cream border border-border rounded-lg text-darktext focus:outline-none focus:border-plum"
                  >
                    <option value="standard">Standard (Essential treatments)</option>
                    <option value="premium">Premium (Complete care)</option>
                    <option value="luxury">Luxury (The ultimate experience)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-mutedtext mb-1">Specific Preferences</label>
                  <textarea 
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="E.g., I have sensitive skin, want organic products only..."
                    className="w-full p-3 bg-cream border border-border rounded-lg text-darktext focus:outline-none focus:border-plum resize-none"
                    rows={3}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isGenerating || !date}
                  className="w-full bg-plum text-warmwhite py-3 rounded-lg font-medium hover:bg-plum-dark transition-colors shadow-sm mt-4 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating Timeline...' : 'Generate Journey'}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Generated Plan Preview */}
          <div className="w-full lg:w-[60%]">
            {isGenerating ? (
              <div className="bg-white p-8 rounded-xl border border-border h-full min-h-[400px] flex flex-col items-center justify-center space-y-4 shadow-sm animate-pulse">
                <div className="w-16 h-16 bg-cream rounded-full border-4 border-plum border-t-transparent animate-spin"></div>
                <p className="text-mutedtext font-medium">Aura is designing your schedule...</p>
              </div>
            ) : plan ? (
              <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm h-full animate-in fade-in">
                <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                  <div>
                    <h2 className="text-2xl font-serif text-darktext">{plan.title}</h2>
                    <p className="text-sm text-mutedtext mt-1">Based on a {budget} budget leading up to {new Date(date).toLocaleDateString()}</p>
                  </div>
                  <button className="px-4 py-2 border border-border text-darktext text-sm font-medium rounded hover:bg-cream transition-colors">
                    Save Plan
                  </button>
                </div>
                
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {plan.phases.map((phase: any, idx: number) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${phase.color} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                      </div>
                      <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-border shadow-sm ${phase.bgLight}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-darktext text-sm uppercase tracking-wide">{phase.title}</h3>
                        </div>
                        <div className="space-y-3">
                          {phase.tasks.map((task: any, tIdx: number) => (
                            <div key={tIdx} className="bg-white p-3 rounded border border-border/50 text-sm flex justify-between items-center">
                              <div>
                                <p className="font-medium text-darktext">{task.name}</p>
                                <p className="text-xs text-mutedtext mt-0.5">{task.type}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-darktext mb-1">{task.price}</p>
                                <Link href="/salons" className="text-xs text-plum hover:underline">Find Salon</Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              <div className="bg-cream border border-dashed border-border rounded-xl h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                <span className="text-4xl mb-4">✨</span>
                <h3 className="text-xl font-medium text-darktext mb-2">Your timeline awaits</h3>
                <p className="text-mutedtext max-w-sm">
                  Fill out your event details on the left, and Aura will curate a week-by-week beauty regimen perfectly timed for your big day.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
