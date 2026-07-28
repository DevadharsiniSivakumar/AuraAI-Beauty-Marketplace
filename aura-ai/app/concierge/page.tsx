'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Heart,
  Compass,
  Camera,
  Scissors,
  MessageSquare,
  ArrowLeft,
  LogOut,
  Sparkles,
  Send,
  Store,
  TrendingUp
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendations?: any[];
}

export default function ConciergePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Welcome to the Aura AI Concierge. I can help you plan complex beauty journeys, compare local salons, or manage your appointments. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Plan a 4-week bridal prep schedule.",
    "Compare the top 3 luxury salons in Indiranagar.",
    "Help me choose a treatment for dry hair."
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.substring(0, 2).toUpperCase();

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
    <div className="flex h-screen bg-cream overflow-hidden text-darktext">
      
      {/* Sidebar - Identical to user dashboard and admin console */}
      <aside className="w-64 bg-plum text-warmwhite flex flex-col flex-shrink-0 shadow-xl border-r border-plum-dark/40 z-20">
        <div className="h-20 flex items-center px-6 border-b border-plum-dark/50 gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0c051a] flex items-center justify-center border border-rosegold-300/40">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover scale-[1.7]" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-wide text-white">Aura Hub</span>
        </div>
        
        {/* Navigation Sidebar List */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          <Link 
            href="/dashboard?tab=overview"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <LayoutDashboard className="w-4 h-4 text-peach" />
            Overview
          </Link>

          <Link 
            href="/salons"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <Store className="w-4 h-4 text-peach" />
            Explore Salons
          </Link>

          <Link 
            href="/dashboard?tab=saved"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <Heart className="w-4 h-4 text-peach" />
            Saved Salons
          </Link>

          <Link 
            href="/dashboard?tab=bookings"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <Calendar className="w-4 h-4 text-peach" />
            My Bookings
          </Link>

          <Link 
            href="/dashboard?tab=journey"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <Compass className="w-4 h-4 text-peach" />
            Beauty Journey
          </Link>

          <Link 
            href="/advisor"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <Camera className="w-4 h-4 text-peach" />
            Selfie Scanner
          </Link>

          <Link 
            href="/compare"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 text-warmwhite/75 hover:bg-cream/5 hover:text-white"
          >
            <TrendingUp className="w-4 h-4 text-peach" />
            Compare Salons
          </Link>
        </nav>

        {/* Sidebar Footer Operations */}
        <div className="p-4 border-t border-plum-dark/50 space-y-1.5 flex-shrink-0">
          <Link 
            href="/"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-warmwhite/75 hover:text-white transition-colors rounded-lg hover:bg-cream/5 text-left"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose hover:text-rose-dark transition-colors rounded-lg hover:bg-rose/10 text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out Account
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-border flex items-center justify-between px-8 flex-shrink-0 shadow-xs z-10">
          <h2 className="text-xl font-serif font-bold text-darktext capitalize flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-plum animate-pulse" />
            Aura AI Concierge
          </h2>
          
          <div className="flex items-center gap-3.5">
            <div className="text-right">
              <p className="text-xs font-bold text-darktext">{userName}</p>
              <p className="text-[10px] text-mutedtext">{user?.email || 'Authenticated client'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-plum text-warmwhite flex items-center justify-center font-bold text-sm shadow-md border-2 border-peach">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Content Workspace */}
        <main className="flex-grow overflow-hidden p-8 bg-cream/40 flex justify-center items-center">
          <div className="w-full max-w-4xl flex flex-col bg-white border border-border rounded-2xl shadow-xs overflow-hidden h-[calc(100vh-12rem)]">
            
            {/* Chat Area Header */}
            <div className="bg-white border-b border-border p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-plum text-warmwhite flex items-center justify-center font-serif italic text-lg shadow-sm">
                  A
                </div>
                <div>
                  <h1 className="font-bold text-darktext text-sm leading-tight">Interactive Beauty Chat</h1>
                  <p className="text-[10px] text-mutedtext">Ask about treatments, comparison tables, bookings or reschedules</p>
                </div>
              </div>
              {isTyping && (
                <span className="text-[10px] text-mutedtext animate-pulse">Aura is formulating response...</span>
              )}
            </div>

            {/* Chat Area Messages */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-cream/20">
              {messages.map((msg, idx) => {
                const isAura = msg.role === 'assistant';
                return (
                  <div key={idx} className={`flex ${isAura ? 'justify-start' : 'justify-end'} animate-in fade-in`}>
                    <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] ${isAura ? 'items-start' : 'items-end'}`}>
                      <div className={`p-4 text-xs sm:text-sm leading-relaxed ${
                        isAura 
                          ? 'bg-white border border-border text-darktext rounded-2xl rounded-tl-sm shadow-xs' 
                          : 'bg-plum text-warmwhite rounded-2xl rounded-tr-sm shadow-xs'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        
                        {/* Compact Salon Cards */}
                        {isAura && msg.recommendations && msg.recommendations.length > 0 && (
                          <div className="mt-4 space-y-2.5 pt-3 border-t border-border border-dashed">
                            <p className="text-[10px] font-bold text-mutedtext uppercase tracking-wider">Relevant Recommendations</p>
                            {msg.recommendations.map((rec, rIdx) => (
                              <div key={rIdx} className="bg-cream/40 p-3 rounded-xl border border-border/60 hover:border-plum/30 transition-all flex justify-between items-center group">
                                <div className="text-left">
                                  <strong className="block text-darktext font-bold text-xs">{rec.name}</strong>
                                  <span className="text-[10px] text-mutedtext">{rec.type === 'salon' ? 'Salon Profile' : 'Service Booking'}</span>
                                </div>
                                <Link 
                                  href={rec.type === 'salon' ? `/salons/${rec.id}` : `/booking?salon=${rec.salonId}&service=${rec.id}`}
                                  className="px-3 py-1.5 bg-white border border-border text-[10px] font-bold text-darktext rounded-lg hover:text-plum hover:border-plum transition-colors"
                                >
                                  Open Link
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-mutedtext px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex justify-start animate-in fade-in">
                  <div className="bg-white border border-border rounded-2xl rounded-tl-sm p-4 shadow-xs flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-plum rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-plum rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-plum rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                      onClick={() => setInput(prompt)}
                      className="text-[10px] bg-cream hover:bg-cream-dark border border-border text-mutedtext px-3.5 py-1.5 rounded-full transition-colors text-left font-semibold cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Concierge about treatments, scheduling or comparisons..."
                  className="w-full bg-cream border border-border text-darktext text-xs rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-plum resize-none"
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
                  className="absolute right-2 p-2 bg-plum text-warmwhite rounded-lg hover:bg-plum-dark transition-all disabled:opacity-50 disabled:bg-border cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </main>
      </div>

    </div>
  );
}
