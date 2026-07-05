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
  Tag,
  CheckCircle,
  History,
  XCircle
} from 'lucide-react';

export default function AiConcierge() {
  const { salons, userProfile, bookings, userMemory, beautyProfile } = useApp();
  
  // Store chat history in local state for custom concierge pipeline
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'aura',
      text: `Hello ${userProfile.name.split(' ')[0]}! I'm Aura, your personal concierge.

Whether you're looking for a relaxing facial under a specific budget, a premium stylist in Indiranagar, or matching recommendations for your skin/hair type, tell me what you need and I'll find it!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendations: []
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    { label: "Facial under ₹3000", text: "Find a hydra facial under ₹3000" },
    { label: "Luxury Indiranagar Salons", text: "Recommend luxury salons in Indiranagar" },
    { label: "Suggest a haircut", text: "Suggest a hairstyle or haircut for my oval face" },
    { label: "Wedding next month", text: "I have a wedding next month, help me plan my skin routine" }
  ];

  const historicalConversations: any[] = [];

  // Auto scroll to chat end
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  // Update welcome message dynamically with actual username when authenticated profile loads
  useEffect(() => {
    if (userProfile && userProfile.name) {
      const firstName = userProfile.name.split(' ')[0];
      setMessages(prev => {
        if (prev.length > 0 && prev[0].id === 'welcome-msg') {
          const updated = [...prev];
          updated[0] = {
            ...updated[0],
            text: `Hello ${firstName}! I'm Aura, your personal concierge.

Whether you're looking for a relaxing facial under a specific budget, a premium stylist in Indiranagar, or matching recommendations for your skin/hair type, tell me what you need and I'll find it!`
          };
          return updated;
        }
        return prev;
      });
    }
  }, [userProfile.name]);

  const handleSubmit = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAiTyping(true);
    setLoadingStage('Understanding Request');

    // Timed progressive loading stages
    const timer1 = setTimeout(() => setLoadingStage('Searching Salons'), 600);
    const timer2 = setTimeout(() => setLoadingStage('Ranking Matches'), 1200);
    const timer3 = setTimeout(() => setLoadingStage('Generating Recommendations'), 1800);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/concierge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          userProfile,
          bookings,
          userMemory,
          beautyProfile
        })
      });

      if (!response.ok) {
        throw new Error('Concierge API returned non-OK status');
      }

      const data = await response.json();

      // Ensure loading stages show for at least 2.4s total for a premium feel
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, 2400 - elapsed);

      setTimeout(() => {
        const auraMsg: ChatMessage = {
          id: `msg-${Date.now()}-aura`,
          sender: 'aura',
          text: data.response,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendations: data.recommendations,
          comparison: data.comparison
        };
        
        setMessages(prev => [...prev, auraMsg]);
        setIsAiTyping(false);
        setLoadingStage('');
      }, delay);

    } catch (err) {
      console.error('Error contacting concierge API:', err);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      setTimeout(() => {
        const errorMsg: ChatMessage = {
          id: `msg-${Date.now()}-aura-error`,
          sender: 'aura',
          text: `I apologize, ${userProfile.name.split(' ')[0]}. I'm currently unable to retrieve our salon databases. Please check your connection or try again shortly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendations: []
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsAiTyping(false);
        setLoadingStage('');
      }, 1000);
    }
  };

  // Find all unique recommendations across chat logs to list in the sidebar
  const allRecommendations = messages
    .flatMap(m => m.recommendations || [])
    .filter((value, index, self) => 
      self.findIndex(v => v.id === value.id) === index
    );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-black">
      <Navbar />

      <div className="flex-grow flex overflow-hidden max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Left Sidebar - History & Active Recommendations */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 gap-6 h-full overflow-y-auto pb-4">
          
          {/* Conversational History */}
          <div className="p-5 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              Recent Consults
            </h3>
            <div className="space-y-2">
              {historicalConversations.length > 0 ? (
                historicalConversations.map((hist, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSubmit(hist.title)}
                    className="w-full text-left p-2 rounded-md text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors block border border-transparent"
                  >
                    <p className="font-semibold text-gray-800 dark:text-white truncate">{hist.title}</p>
                    <span className="text-gray-500 block text-xs pt-0.5">{hist.date}</span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic pl-1">No recent consultations found.</p>
              )}
            </div>
          </div>

          {/* Extracted Recommendations Grid */}
          <div className="p-5 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-1 flex flex-col gap-4 overflow-hidden">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 shrink-0">
              <Tag className="w-4 h-4 text-gray-500" />
              Active Recommendations
            </h3>
            
            <div className="flex-grow overflow-y-auto space-y-3 pr-1">
              {allRecommendations.length > 0 ? (
                allRecommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black space-y-2 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase block mb-0.5">{rec.type}</span>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{rec.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{rec.details}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white shrink-0 ml-1">
                        {rec.matchScore || 90}%
                      </span>
                    </div>
                    {rec.type === 'service' ? (
                      <Link
                        href={`/booking?salon=${rec.salonId}&service=${rec.id}`}
                        className="w-full py-1.5 text-center rounded-md bg-gray-900 text-white dark:bg-white dark:text-black text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Book Appointment
                      </Link>
                    ) : (
                      <Link
                        href={`/salons/${rec.id}`}
                        className="w-full py-1.5 text-center rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-1 transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Explore Profile
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 text-xs font-light space-y-2">
                  <Compass className="w-8 h-8 mx-auto text-gray-300" />
                  <p>Ask Aura questions to receive live booking options here.</p>
                </div>
              )}
            </div>
          </div>

        </aside>

        {/* Right Chat Container */}
        <section className="flex-1 flex flex-col rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden h-full">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-md bg-gray-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                  Aura
                </h2>
                <p className="text-xs text-gray-500">Consulting for {userProfile.name} • Profile Active</p>
              </div>
            </div>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => {
              const isAura = msg.sender === 'aura';
              return (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${isAura ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isAura 
                      ? 'bg-gray-900 text-white font-bold' 
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
                  }`}>
                    {isAura ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="space-y-3">
                    {/* Chat Bubble */}
                    <div className={`p-4 rounded-md text-sm leading-relaxed ${
                      isAura 
                        ? 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700' 
                        : 'bg-gray-900 dark:bg-white text-white dark:text-black'
                    }`}>
                      <p className={`whitespace-pre-line ${
                        isAura 
                          ? 'text-gray-900 dark:text-gray-100 font-normal' 
                          : 'font-semibold'
                      }`}>
                        {msg.text}
                      </p>
                      <span className={`block text-xs pt-1.5 ${
                        isAura 
                          ? 'text-gray-500' 
                          : 'opacity-80'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* V2 Recommended Cards with reasoning list */}
                    {isAura && msg.recommendations && msg.recommendations.length > 0 && !msg.comparison && (
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
                              className="p-4 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-black flex flex-col justify-between space-y-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                            >
                              {/* Memory alert header if present */}
                              {memoryIndicator && (
                                <div className="text-xs text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                                  <Sparkles className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                  <span>{memoryIndicator}</span>
                                </div>
                              )}

                              {/* Salon details card */}
                              <div className="space-y-3">
                                <div className="relative h-24 w-full rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={image} alt={rec.name} className="w-full h-full object-cover" />
                                  <div className="absolute top-2 right-2 bg-gray-900 text-white dark:bg-white dark:text-black font-bold text-xs px-2 py-0.5 rounded-sm">
                                    {matchScore}% Match
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{rec.name}</h4>
                                  <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span className="flex items-center gap-0.5 truncate">
                                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                      {location.split(',')[0]}
                                    </span>
                                    <span className="flex items-center gap-0.5 font-medium shrink-0">
                                      <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                      {rating}
                                    </span>
                                  </div>
                                  <p className="text-xs font-medium text-gray-800 dark:text-white pt-1">
                                    {rec.type === 'service' ? `Treatment: ₹${rec.price}` : `Services from: ₹${startingPrice}`}
                                  </p>
                                </div>

                                {/* Why Aura Recommends This */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
                                  <span className="text-xs font-semibold text-gray-500 block">Why we recommend this:</span>
                                  <div className="space-y-1">
                                    {reasons.map((reason, rIdx) => (
                                      <p key={rIdx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                                        <span className="text-green-500 font-bold shrink-0">✓</span>
                                        <span>{reason}</span>
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex gap-2">
                                  {rec.type === 'service' ? (
                                    <Link
                                      href={`/booking?salon=${rec.salonId}&service=${rec.id}`}
                                      className="flex-grow py-2 text-center rounded-md bg-gray-900 text-white dark:bg-white dark:text-black text-xs font-bold transition-colors"
                                    >
                                      Book Now
                                    </Link>
                                  ) : (
                                    <Link
                                      href={`/booking?salon=${rec.id}`}
                                      className="flex-grow py-2 text-center rounded-md bg-gray-900 text-white dark:bg-white dark:text-black text-xs font-bold transition-colors"
                                    >
                                      Book Now
                                    </Link>
                                  )}
                                  <Link
                                    href={`/salons/${salonId}`}
                                    className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center shrink-0"
                                    title="View Salon Profile"
                                  >
                                    Profile
                                  </Link>
                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* V2 Comparison Cards directly inside chat stream */}
                    {isAura && msg.comparison && (
                      <div className="space-y-6 pt-2 max-w-3xl">
                        {/* 1. AI Recommendation Banner */}
                        <div className="bg-gray-900 text-white dark:bg-gray-100 dark:text-black rounded-md p-5 relative overflow-hidden">
                          <div className="relative z-10 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-md bg-white/20 dark:bg-black/20 flex items-center justify-center shrink-0">
                              <Star className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold mb-1">Our Recommendation</h5>
                              <h4 className="text-sm font-bold mb-1">{msg.comparison.recommendation.recommendedSalonName}</h4>
                              <p className="text-xs leading-relaxed opacity-90">
                                {msg.comparison.recommendation.reasonText}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 2. Side-by-Side Comparison Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {msg.comparison.feature1Comparison.map((salon, cIdx) => {
                            const salonObj = salons.find(s => s.name === salon.salonName);
                            return (
                              <div key={cIdx} className="bg-white dark:bg-black rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col justify-between">
                                <div className="p-4 space-y-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">{salon.salonName}</h5>
                                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-gray-100 dark:bg-gray-800 mt-1">
                                        <Sparkles className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{salon.aiRecommendationBadge}</span>
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <div className="flex items-center justify-end font-medium text-sm text-gray-900 dark:text-white">
                                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500 mr-0.5" />
                                        {salon.rating}
                                      </div>
                                      <span className="text-xs text-gray-500 block">{salon.priceRange}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-800 text-xs">
                                    <div>
                                      <span className="text-xs text-gray-500 block mb-0.5">Review Consensus</span>
                                      <p className="font-medium text-gray-800 dark:text-white">{salon.reviewScore}</p>
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 block mb-1 font-medium">Popular Treatments</span>
                                      <div className="flex flex-wrap gap-1">
                                        {salon.popularServices.map((srv, sIdx) => (
                                          <span key={sIdx} className="text-xs px-2 py-1 rounded-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                            {srv}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {salonObj && (
                                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                                    <Link 
                                      href={`/booking?salon=${salonObj.id}`}
                                      className="text-xs font-bold text-gray-900 dark:text-white hover:underline flex items-center gap-1 w-fit"
                                    >
                                      Book Now <Compass className="w-3 h-3" />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* 3. Review Intelligence Panel */}
                        <div className="space-y-4">
                          <h5 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                            <Star className="w-4 h-4 text-gray-500" />
                            Review Insights
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {msg.comparison.feature2ReviewIntelligence.map((intel, intelIdx) => {
                              const isPositive = intel.overallSentiment.toLowerCase() === 'positive';
                              const isNegative = intel.overallSentiment.toLowerCase() === 'negative';
                              return (
                                <div key={intelIdx} className="bg-white dark:bg-black rounded-md border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h6 className="text-sm font-bold text-gray-900 dark:text-white truncate">{intel.salonName}</h6>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-sm ${
                                      isPositive
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        : isNegative
                                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    }`}>
                                      {intel.overallSentiment}
                                    </span>
                                  </div>

                                  <div className="space-y-3 pt-1">
                                    {/* Strengths */}
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Key Strengths</span>
                                      <div className="space-y-1">
                                        {intel.topStrengths.map((str, sIdx) => (
                                          <p key={sIdx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                                            <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                            <span>{str}</span>
                                          </p>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Complaints */}
                                    <div className="space-y-1">
                                      <span className="text-xs text-gray-500 font-medium block">Common Complaints</span>
                                      <div className="space-y-1">
                                        {intel.commonComplaints && intel.commonComplaints.length > 0 && intel.commonComplaints[0] !== '' ? (
                                          intel.commonComplaints.map((comp, cIdx) => (
                                            <p key={cIdx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                                              <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                              <span>{comp}</span>
                                            </p>
                                          ))
                                        ) : (
                                          <p className="text-xs text-gray-500 italic">No significant complaints found.</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Typing & Loading Experience Indicator */}
            {isAiTyping && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-start">
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="p-3 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center space-x-1 w-fit">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                  {loadingStage && (
                    <span className="text-xs text-gray-500 font-medium pl-1">
                      {loadingStage}...
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat input controls */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 space-y-4 shrink-0">
            
            {/* Suggested prompts list */}
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(p.text)}
                  className="text-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              className="flex items-center gap-2 bg-white dark:bg-black p-2 rounded-md border border-gray-300 dark:border-gray-700"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Aura (e.g. Find hair coloring packages or facials near Koramangala)..."
                className="flex-1 text-sm bg-transparent border-0 focus:outline-hidden focus:ring-0 px-2 text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button
                type="submit"
                className="p-2 rounded-md bg-gray-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
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

