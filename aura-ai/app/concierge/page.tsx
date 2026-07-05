'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useApp, ChatMessage } from '../context/AppContext';

export default function AiConcierge() {
  const { salons, userProfile, bookings, userMemory, beautyProfile } = useApp();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'aura',
      text: `Hello! I'm Aura, your personal concierge.\n\nTell me what you need, like "Find a facial under ₹3000 in Indiranagar" or "I need a haircut for an oval face."`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendations: []
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Facial under ₹3000",
    "Luxury Indiranagar Salons",
    "Suggest a haircut",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

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

    try {
      const response = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          userProfile,
          bookings,
          userMemory,
          beautyProfile
        })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();

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
      }, 500);

    } catch (err) {
      setTimeout(() => {
        const errorMsg: ChatMessage = {
          id: `msg-${Date.now()}-aura-error`,
          sender: 'aura',
          text: `I apologize, I'm currently unable to retrieve our salon databases. Please try again shortly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendations: []
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsAiTyping(false);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FCFAF8]">
      <Navbar />

      <div className="flex-grow flex overflow-hidden max-w-7xl w-full mx-auto sm:px-6 lg:px-8 py-4 sm:py-6 gap-6">
        
        {/* Left Sidebar - History */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#FFFFFF] border border-[#E5DED8] rounded-md overflow-hidden h-full">
          <div className="p-4 border-b border-[#E5DED8] bg-[#FCFAF8]">
            <h3 className="font-bold text-[#2D2926]">Chat History</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2 text-sm">
            <p className="text-[#716A65] text-xs italic">No previous chats.</p>
          </div>
        </aside>

        {/* Right Chat Container */}
        <section className="flex-1 flex flex-col bg-[#FFFFFF] border-y sm:border border-[#E5DED8] sm:rounded-md overflow-hidden h-full relative">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-[#E5DED8] bg-[#FCFAF8] flex items-center shrink-0">
            <div>
              <h2 className="text-base font-bold text-[#2D2926]">Aura Concierge</h2>
              <p className="text-xs text-[#716A65]">Active</p>
            </div>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#FCFAF8]">
            {messages.map((msg) => {
              const isAura = msg.sender === 'aura';
              return (
                <div key={msg.id} className={`flex max-w-[85%] ${isAura ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                  <div className={`p-3 rounded-lg text-sm ${
                    isAura 
                      ? 'bg-[#FFFFFF] border border-[#E5DED8] text-[#2D2926]' 
                      : 'bg-[#2D2926] text-white'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Render basic recommendations if available */}
                    {isAura && msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-[#E5DED8] pt-3">
                        {msg.recommendations.map((rec, idx) => (
                          <div key={idx} className="bg-[#FCFAF8] p-2 rounded border border-[#E5DED8] text-xs">
                            <strong className="block text-[#2D2926]">{rec.name}</strong>
                            <Link 
                              href={rec.type === 'salon' ? `/salons/${rec.id}` : `/booking?salon=${rec.salonId}&service=${rec.id}`}
                              className="text-[#9D5965] hover:underline mt-1 inline-block"
                            >
                              View &rarr;
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <span className={`block text-[10px] mt-2 text-right ${isAura ? 'text-[#716A65]' : 'text-gray-300'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isAiTyping && (
              <div className="flex max-w-[85%] mr-auto">
                <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E5DED8] text-[#716A65] text-sm flex items-center gap-1">
                  Typing...
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat input controls */}
          <div className="p-4 border-t border-[#E5DED8] bg-[#FFFFFF] shrink-0">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(p)}
                  className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-[#E5DED8] bg-[#FCFAF8] text-[#716A65] hover:text-[#2D2926] hover:border-[#9D5965] transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(inputText);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message Aura..."
                className="flex-1 text-sm bg-[#FCFAF8] border border-[#E5DED8] rounded-full px-4 py-3 focus:outline-none focus:border-[#9D5965] text-[#2D2926]"
              />
              <button
                type="submit"
                className="p-3 rounded-full bg-[#2D2926] text-white hover:bg-[#1a1715] transition-colors"
              >
                Send
              </button>
            </form>
          </div>

        </section>

      </div>
    </div>
  );
}
