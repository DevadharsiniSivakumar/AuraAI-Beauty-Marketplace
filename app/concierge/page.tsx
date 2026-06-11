'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useApp, ChatMessage } from '../context/AppContext';
import { 
  Sparkles, 
  Send, 
  User, 
  Calendar, 
  Compass, 
  MapPin, 
  Star,
  ArrowRight,
  PlusCircle,
  Clock,
  History,
  Tag,
  CheckCircle
} from 'lucide-react';

export default function AiConcierge() {
  const { chatHistory, sendChatMessage, salons, userProfile } = useApp();
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    { label: "Facial under ₹3000", text: "Find a hydra facial under ₹3000" },
    { label: "Luxury Indiranagar Salons", text: "Recommend luxury salons in Indiranagar" },
    { label: "Suggest a haircut", text: "Suggest a hairstyle or haircut for me" },
    { label: "Wedding next month", text: "I have a wedding next month" }
  ];

  const historicalConversations = [
    { title: 'Hydra facial recommendation', date: 'Yesterday' },
    { title: 'Hairstyle options for oval face', date: '3 days ago' },
    { title: 'Waxing packages comparison', date: 'June 02' }
  ];

  // Auto scroll to chat end
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiTyping]);

  const handleSubmit = (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    sendChatMessage(textToSend);
    setInputText('');
    setIsAiTyping(true);

    // Turn off typing indicator when simulated message comes in
    setTimeout(() => {
      setIsAiTyping(false);
    }, 1200);
  };

  // Find all recommendations across all chat messages to display in the sidebar
  const allRecommendations = chatHistory
    .flatMap(m => m.recommendations || [])
    .filter((value, index, self) => 
      self.findIndex(v => v.id === value.id) === index
    );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-rosegold-50 dark:bg-charcoal-950">
      <Navbar />

      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Left Sidebar - History & Active Recommendations */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 gap-6 h-full overflow-y-auto pb-4">
          
          {/* Conversational History */}
          <div className="p-5 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 space-y-4">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-rosegold-500" />
              Recent Consults
            </h3>
            <div className="space-y-2">
              {historicalConversations.map((hist, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSubmit(hist.title)}
                  className="w-full text-left p-2.5 rounded-xl text-xs hover:bg-rosegold-50 dark:hover:bg-charcoal-800 transition-colors block border border-transparent hover:border-rosegold-100"
                >
                  <p className="font-semibold text-charcoal-800 dark:text-white line-clamp-1">{hist.title}</p>
                  <span className="text-charcoal-400 block text-[10px] pt-0.5">{hist.date}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Extracted Recommendations Grid */}
          <div className="p-5 rounded-2xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 flex-1 flex flex-col gap-4 overflow-hidden">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-2 shrink-0">
              <Tag className="w-4 h-4 text-rosegold-500" />
              Active Recommendations
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {allRecommendations.length > 0 ? (
                allRecommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl border border-rosegold-150 dark:border-charcoal-800 bg-rosegold-50/10 dark:bg-charcoal-950/20 space-y-2 hover:border-rosegold-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-rosegold-500 uppercase tracking-widest">{rec.type}</span>
                        <h4 className="text-xs font-semibold text-charcoal-900 dark:text-white line-clamp-1">{rec.name}</h4>
                        <p className="text-[10px] text-charcoal-400">{rec.details}</p>
                      </div>
                      <span className="text-[10px] font-bold text-rosegold-500 shrink-0">
                        {rec.matchScore || 90}%
                      </span>
                    </div>
                    {rec.type === 'service' ? (
                      <Link
                        href={`/booking?salon=${rec.salonId}&service=${rec.id}`}
                        className="w-full py-1.5 text-center rounded-lg bg-rosegold-500 hover:bg-rosegold-600 text-[10px] font-bold text-white flex items-center justify-center gap-1 transition-colors"
                      >
                        <Calendar className="w-3 h-3" />
                        Book Appointment
                      </Link>
                    ) : (
                      <Link
                        href={`/salons/${rec.id}`}
                        className="w-full py-1.5 text-center rounded-lg border border-rosegold-300 dark:border-charcoal-800 hover:bg-rosegold-100 dark:hover:bg-charcoal-800 text-[10px] font-bold text-charcoal-800 dark:text-rosegold-100 flex items-center justify-center gap-1 transition-all"
                      >
                        <Compass className="w-3 h-3" />
                        Explore Profile
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-charcoal-400 text-xs font-light space-y-2">
                  <Compass className="w-8 h-8 mx-auto text-charcoal-300" />
                  <p>Ask Aura questions to receive live booking options here.</p>
                </div>
              )}
            </div>
          </div>

        </aside>

        {/* Right Chat Container */}
        <section className="flex-1 flex flex-col rounded-3xl border border-rosegold-200 dark:border-charcoal-850 bg-white dark:bg-charcoal-900 shadow-lg overflow-hidden h-full">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-rosegold-100 dark:border-charcoal-800 flex items-center justify-between bg-linear-to-r from-rosegold-100/20 to-white dark:from-charcoal-905 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-rosegold-500 to-gold-metallic flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-charcoal-950 dark:text-white flex items-center">
                  Aura Beauty AI
                  <span className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                </h2>
                <p className="text-xs text-charcoal-450 dark:text-rosegold-300">Consulting for {userProfile.name} • Active DNA Profile</p>
              </div>
            </div>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatHistory.map((msg) => {
              const isAura = msg.sender === 'aura';
              return (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${isAura ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 shadow-xs ${
                    isAura 
                      ? 'bg-linear-to-tr from-rosegold-500 to-gold-metallic text-white font-bold' 
                      : 'bg-charcoal-700 dark:bg-charcoal-800 text-white font-semibold'
                  }`}>
                    {isAura ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="space-y-3">
                    {/* Chat Bubble */}
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isAura 
                        ? 'bg-rosegold-50/50 dark:bg-charcoal-950/40 border border-rosegold-200/50 dark:border-charcoal-800 text-charcoal-900 dark:text-rosegold-150' 
                        : 'bg-linear-to-r from-rosegold-500 to-gold-metallic text-white shadow-xs'
                    }`}>
                      <p className="whitespace-pre-line font-light">{msg.text}</p>
                      <span className={`block text-[10px] pt-1.5 ${isAura ? 'text-charcoal-400' : 'text-rosegold-200'}`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* V2 Inline recommended cards with matching scores and reasoning lists */}
                    {isAura && msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        {msg.recommendations.map((rec, idx) => {
                          const salonId = rec.type === 'salon' ? rec.id : rec.salonId;
                          const salonObj = salons.find(s => s.id === salonId);
                          const rating = salonObj?.rating || 4.8;
                          const location = salonObj?.location || 'Indiranagar';
                          const image = salonObj?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=300';
                          const startingPrice = salonObj ? Math.min(...salonObj.services.map(s => s.price)) : 1600;
                          const matchScore = rec.matchScore || salonObj?.matchScore || 90;
                          const reasons = rec.reasons || ['Highly rated by local users', 'Matches your budget segment'];
                          const memoryIndicator = rec.memoryIndicator;

                          return (
                            <div 
                              key={idx}
                              className="p-4 rounded-2xl border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 flex flex-col justify-between space-y-4 shadow-sm hover:border-rosegold-350 transition-all"
                            >
                              {/* Memory alert header if present */}
                              {memoryIndicator && (
                                <div className="text-[10px] text-rosegold-600 dark:text-gold-medium font-semibold flex items-center gap-1 bg-rosegold-100/30 dark:bg-charcoal-900/60 p-2 rounded-lg">
                                  <Sparkles className="w-3.5 h-3.5 text-rosegold-500 shrink-0" />
                                  <span>{memoryIndicator}</span>
                                </div>
                              )}

                              {/* Salon details card */}
                              <div className="space-y-3">
                                <div className="relative h-24 w-full rounded-xl overflow-hidden">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={image} alt={rec.name} className="w-full h-full object-cover" />
                                  <div className="absolute top-2 right-2 bg-linear-to-r from-rosegold-550 to-gold-metallic text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                                    {matchScore}% Match
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-charcoal-900 dark:text-white line-clamp-1">{rec.name}</h4>
                                  <div className="flex justify-between items-center text-xs text-charcoal-400">
                                    <span className="flex items-center gap-0.5">
                                      <MapPin className="w-3 h-3 text-rosegold-500" />
                                      {location.split(',')[0]}
                                    </span>
                                    <span className="flex items-center gap-0.5 text-rosegold-500 font-bold">
                                      <Star className="w-3 h-3 fill-rosegold-500" />
                                      {rating}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-charcoal-650 dark:text-rosegold-150 pt-1">
                                    {rec.type === 'service' ? `Treatment: ₹${rec.price}` : `Services from: ₹${startingPrice}`}
                                  </p>
                                </div>

                                {/* Why AuraAI Recommends This */}
                                <div className="pt-2.5 border-t border-rosegold-100 dark:border-charcoal-850 space-y-1.5">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-charcoal-450 block">Why AuraAI Recommends This</span>
                                  <div className="space-y-1">
                                    {reasons.map((reason, rIdx) => (
                                      <p key={rIdx} className="text-[10px] text-charcoal-550 dark:text-rosegold-200 flex items-start gap-1 leading-relaxed">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>{reason}</span>
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="space-y-2 pt-2 border-t border-rosegold-100 dark:border-charcoal-850">
                                <div className="flex gap-2">
                                  {rec.type === 'service' ? (
                                    <Link
                                      href={`/booking?salon=${rec.salonId}&service=${rec.id}`}
                                      className="flex-1 py-2 text-center rounded-xl bg-linear-to-r from-rosegold-500 to-gold-metallic hover:scale-101 text-xs font-bold text-white flex items-center justify-center gap-1 transition-all shadow-2xs"
                                    >
                                      <Calendar className="w-3.5 h-3.5" />
                                      Book Now
                                    </Link>
                                  ) : (
                                    <Link
                                      href={`/salons/${rec.id}`}
                                      className="flex-1 py-2 text-center rounded-xl bg-linear-to-r from-rosegold-500 to-gold-metallic hover:scale-101 text-xs font-bold text-white flex items-center justify-center gap-1 transition-all shadow-2xs"
                                    >
                                      <Compass className="w-3.5 h-3.5" />
                                      Book Now
                                    </Link>
                                  )}
                                  <Link
                                    href={`/salons/${salonId}`}
                                    className="px-3 py-2 rounded-xl border border-rosegold-200 dark:border-charcoal-800 text-xs font-semibold text-charcoal-700 dark:text-rosegold-100 hover:bg-rosegold-50 dark:hover:bg-charcoal-900 transition-colors flex items-center justify-center"
                                    title="View Salon Profile"
                                  >
                                    Profile
                                  </Link>
                                </div>
                                
                                {/* Suggested Actions */}
                                <div className="flex justify-between items-center text-[9px] text-charcoal-450 pt-1">
                                  <button onClick={() => alert("Alternatives loading...")} className="hover:text-rosegold-550 transition-colors underline font-medium">Compare Alternatives</button>
                                  <button onClick={() => alert("Recommendation saved to your profile!")} className="hover:text-rosegold-550 transition-colors underline font-medium">Save Rec</button>
                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isAiTyping && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-rosegold-550 to-gold-metallic text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-rosegold-50/50 dark:bg-charcoal-950/40 border border-rosegold-200/50 dark:border-charcoal-800 flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 bg-rosegold-400 rounded-full typing-dot"></span>
                  <span className="w-2.5 h-2.5 bg-rosegold-400 rounded-full typing-dot"></span>
                  <span className="w-2.5 h-2.5 bg-rosegold-400 rounded-full typing-dot"></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat input controls */}
          <div className="p-4 border-t border-rosegold-150 dark:border-charcoal-800 bg-white/70 dark:bg-charcoal-900/70 space-y-4 shrink-0">
            
            {/* Suggested prompts list */}
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(p.text)}
                  className="text-xs px-3 py-1.5 rounded-full border border-rosegold-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-charcoal-700 dark:text-rosegold-200 hover:border-rosegold-400 dark:hover:border-rosegold-800 transition-colors shadow-2xs font-light"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Text entry field */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(inputText);
              }}
              className="flex items-center gap-2 bg-rosegold-50/20 dark:bg-charcoal-950/30 p-1.5 rounded-2xl border border-rosegold-200 dark:border-charcoal-800 focus-within:ring-1 focus-within:ring-rosegold-500"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask AuraAI (e.g. Find hair coloring packages or facials near Koramangala)..."
                className="flex-1 text-sm bg-transparent border-0 focus:outline-hidden focus:ring-0 px-3 py-2 text-charcoal-900 dark:text-white placeholder-charcoal-400"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-linear-to-r from-rosegold-500 to-gold-metallic text-white hover:scale-103 transition-transform"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </section>

      </div>
    </div>
  );
}
