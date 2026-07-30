'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendations?: any[];
}

export default function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
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
  
  const { user } = useAuth();
  const { userProfile, bookings, beautyProfile, userMemory } = useApp();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

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
        body: JSON.stringify({ 
          message: userMsg.text, 
          context: "global_concierge",
          chatHistory: messages.slice(-4).map(m => ({ role: m.role, content: m.text })),
          userProfile,
          bookings,
          beautyProfile,
          userMemory
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.reply || data.response || "Sorry, I couldn't generate a response.",
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center justify-center ${
          isOpen ? 'bg-peach text-plum rotate-90 scale-0 opacity-0 pointer-events-none' : 'bg-plum text-peach hover:scale-110 hover:shadow-plum/50'
        }`}
        aria-label="Open AI Concierge"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>

      {/* Chat Window Popup */}
      <div 
        className={`fixed bottom-6 right-6 w-full max-w-sm sm:max-w-md h-[32rem] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-plum/20 flex flex-col z-50 transition-all duration-300 transform origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-plum to-plum-dark text-white p-4 rounded-t-2xl flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-peach animate-pulse" />
            <div>
              <h3 className="font-serif font-bold text-sm">Aura AI Concierge</h3>
              <p className="text-[10px] text-warmwhite/80">Multi-Agent Assistant</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-cream/30 space-y-4">
          {messages.map((msg, idx) => {
            const isAura = msg.role === 'assistant';
            return (
              <div key={idx} className={`flex ${isAura ? 'justify-start' : 'justify-end'} animate-in fade-in`}>
                <div className={`flex flex-col gap-1 max-w-[85%] ${isAura ? 'items-start' : 'items-end'}`}>
                  <div className={`p-3 text-xs sm:text-sm leading-relaxed ${
                    isAura 
                      ? 'bg-white border border-border text-darktext rounded-2xl rounded-tl-sm shadow-xs' 
                      : 'bg-plum text-white rounded-2xl rounded-tr-sm shadow-sm'
                  }`}>
                    {msg.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i !== msg.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  {/* Render Recommendations if present */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="w-full mt-2 space-y-2">
                      {msg.recommendations.slice(0, 2).map((rec: any, rIdx: number) => (
                        <div key={rIdx} className="bg-white border border-border rounded-xl p-3 shadow-xs">
                          <h4 className="font-bold text-plum text-xs mb-1">{rec.name || rec.salonName}</h4>
                          <p className="text-[10px] text-darktext line-clamp-2 mb-2">{rec.details || rec.overallSummary}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <span className="text-[9px] text-mutedtext mx-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-border p-3 rounded-2xl rounded-tl-sm shadow-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-plum rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-plum rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-plum rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-border rounded-b-2xl z-10">
          <form onSubmit={handleSend} className="flex items-end gap-2 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to compare salons, plan a journey, or book..."
              className="flex-grow bg-cream/50 text-darktext text-sm rounded-xl py-3 px-4 border border-border focus:border-plum focus:ring-1 focus:ring-plum outline-none resize-none min-h-[44px] max-h-24 scrollbar-thin"
              rows={1}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !isTyping 
                  ? 'bg-plum text-warmwhite hover:bg-plum-dark hover:scale-105 shadow-md' 
                  : 'bg-border text-mutedtext'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
