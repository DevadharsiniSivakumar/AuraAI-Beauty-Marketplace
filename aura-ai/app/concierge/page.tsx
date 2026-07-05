'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendations?: any[];
}

export default function ConciergePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Welcome to the Aura Concierge. I can help you plan complex beauty journeys, compare salons, or manage your bookings. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Plan a 4-week bridal prep schedule.",
    "Compare the top 3 luxury spas in Indiranagar.",
    "Help me reschedule my upcoming appointment."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, context: "concierge" })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.reply,
        recommendations: data.recommendations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I'm having trouble connecting to the concierge service right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Navbar />

      <main className="flex-grow flex justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-3xl flex flex-col bg-white border border-border rounded-xl shadow-sm overflow-hidden h-[80vh]">
          
          {/* Header */}
          <div className="bg-white border-b border-border p-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-warmwhite font-serif italic text-lg shadow-sm">
                C
              </div>
              <div>
                <h1 className="font-medium text-darktext text-lg leading-tight">Aura Concierge</h1>
                <p className="text-xs text-mutedtext">Advanced planning and comparisons</p>
              </div>
            </div>
            {isTyping && (
              <span className="text-xs text-mutedtext animate-pulse">Concierge is typing...</span>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 bg-cream/30">
            {messages.map((msg, idx) => {
              const isAura = msg.role === 'assistant';
              return (
                <div key={idx} className={`flex ${isAura ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] ${isAura ? 'items-start' : 'items-end'}`}>
                    <div className={`p-4 text-sm leading-relaxed ${
                      isAura 
                        ? 'bg-white border border-border text-darktext rounded-2xl rounded-tl-sm shadow-sm' 
                        : 'bg-blush text-darktext rounded-2xl rounded-tr-sm'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      
                      {/* Compact Salon Cards */}
                      {isAura && msg.recommendations && msg.recommendations.length > 0 && (
                        <div className="mt-4 space-y-3 pt-3 border-t border-border border-dashed">
                          <p className="text-xs font-medium text-mutedtext uppercase tracking-wider">Relevant Links</p>
                          {msg.recommendations.map((rec, rIdx) => (
                            <div key={rIdx} className="bg-cream p-3 rounded-lg border border-border hover:border-plum/30 transition-colors flex justify-between items-center group">
                              <div>
                                <strong className="block text-darktext font-medium">{rec.name}</strong>
                                <span className="text-xs text-mutedtext">{rec.type === 'salon' ? 'Salon Profile' : 'Service Booking'}</span>
                              </div>
                              <Link 
                                href={rec.type === 'salon' ? `/salons/${rec.id}` : `/booking?salon=${rec.salonId}&service=${rec.id}`}
                                className="px-3 py-1.5 bg-white border border-border text-xs font-medium text-darktext rounded group-hover:text-plum transition-colors"
                              >
                                View
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-mutedtext px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-white border border-border rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-border-dark rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-border-dark rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-border-dark rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-border">
            {messages.length === 1 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setInput(prompt);
                    }}
                    className="text-xs bg-cream border border-border text-mutedtext px-3 py-1.5 rounded-full hover:border-sage hover:text-darktext transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSend} className="relative flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Concierge..."
                className="w-full bg-cream border border-border text-darktext text-sm rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-sage resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 bottom-2 p-1.5 bg-sage text-warmwhite rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:bg-border-dark"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
